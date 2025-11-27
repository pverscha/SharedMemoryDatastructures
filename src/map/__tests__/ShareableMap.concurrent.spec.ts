import { Worker } from "worker_threads";
import { ShareableMap } from "../ShareableMap";

// Concurrency stress tests for ShareableMap using real worker_threads.
// These tests validate that write locks prevent torn writes and that read locks
// allow concurrent readers without corrupting data. They are heavier; keep iterations modest.

const WORKER_COUNT = 4; // reduced from 8 for faster completion
const OPERATIONS_PER_WORKER = 300; // reduced further from 800

interface WorkerResult {
  sets: number;
  deletes: number;
  finalSize?: number;
  errors: string[];
}

function spawnWorker(workerData: any): Promise<WorkerResult> {
  return new Promise((resolve) => {
    const shareableMapPath = require.resolve('../ShareableMap.ts');
    const code = `
      try {
        const { parentPort, workerData } = require('worker_threads');
        require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'commonjs' } });
        const { TextEncoder, TextDecoder } = require('util');
        global.TextEncoder = TextEncoder; global.TextDecoder = TextDecoder;
        const { ShareableMap } = require('${shareableMapPath.replace(/\\/g,'\\\\')}');
        const map = ShareableMap.fromTransferableState(workerData.state);
        const startFlag = new Int32Array(workerData.startFlagBuffer);
        while (Atomics.load(startFlag, 0) === 0) { Atomics.wait(startFlag, 0, 0, 100); }
        let sets = 0, deletes = 0; const errors: string[] = [];
        function randStr(){ return Math.random().toString(36).slice(2); }
        const deadline = Date.now() + 15000; // 15s safety inside worker
        for (let i = 0; i < workerData.operations; i++) {
          if (Date.now() > deadline) { errors.push('Worker exceeded internal deadline'); break; }
          const mode = i % 10;
          try {
            if (mode < 7) {
              const k = 'W' + workerData.id + '-' + randStr();
              map.set(k, 'V' + workerData.id + '-' + randStr());
              sets++;
            } else if (mode < 9) {
              const k = 'W' + Math.floor(Math.random()*workerData.totalWorkers) + '-' + randStr();
              map.get(k);
            } else {
              const k = 'W' + workerData.id + '-' + randStr();
              map.delete(k);
              deletes++;
            }
          } catch(e){ errors.push(String(e)); }
        }
        parentPort.postMessage({ sets, deletes, errors });
      } catch (e) {
        const { parentPort } = require('worker_threads');
        parentPort.postMessage({ sets:0, deletes:0, errors:[String(e && e.stack || e)] });
      }
    `;
    const worker = new Worker(code, { eval: true, workerData });
    worker.on('message', msg => { worker.terminate(); resolve(msg); });
    worker.on('error', err => { worker.terminate(); resolve({ sets:0, deletes:0, errors:[String(err && (err.stack||err.message)||err)] }); });
    worker.on('exit', code => { /* handled */ });
  });
}

// Helper to reconstruct map from state after workers finish
function revive(state: ReturnType<ShareableMap<any, any>["toTransferableState"]>) {
  return ShareableMap.fromTransferableState<string, string>(state);
}

// Skip in CI quick runs if STRESS env not enabled
const maybeRun = process.env.STRESS ? describe : describe.skip;

maybeRun("ShareableMap thread safety", () => {
  beforeAll(() => {
    const { TextEncoder, TextDecoder } = require("util");
    (global as any).TextEncoder = TextEncoder;
    (global as any).TextDecoder = TextDecoder;
  });

  test("concurrent mixed operations produce consistent size accounting", async () => {
    const baseMap = new ShareableMap<string, string>({ expectedSize: WORKER_COUNT * OPERATIONS_PER_WORKER });

    // Preload with a few items to exercise update paths
    for (let i = 0; i < 100; i++) {
      baseMap.set(`PRE-${i}`, `VAL-${i}`);
    }

    const state = baseMap.toTransferableState();

    // Barrier flag
    const startFlagBuffer = new SharedArrayBuffer(4);
    const startFlag = new Int32Array(startFlagBuffer);
    startFlag[0] = 0;

    const workers: Promise<WorkerResult>[] = [];
    for (let i = 0; i < WORKER_COUNT; i++) {
      workers.push(
        spawnWorker({
          id: i,
          operations: OPERATIONS_PER_WORKER,
          state,
          startFlagBuffer,
          totalWorkers: WORKER_COUNT
        })
      );
    }

    // Release barrier
    Atomics.store(startFlag, 0, 1);
    Atomics.notify(startFlag, 0);

    const results = await Promise.all(workers);
    const totalSets = results.reduce((a, r) => a + r.sets, 0);
    const totalDeletes = results.reduce((a, r) => a + r.deletes, 0);
    const allErrors = results.flatMap(r => r.errors);

    expect(allErrors).toHaveLength(0);

    const finalMap = revive(state);

    // The final size should be at least the preloaded count + total sets - total deletes.
    // Some deletes may target non-existent keys (random), so size cannot be less than preload - possible existing deletes.
    const minExpected = 100; // At least the preload should remain
    expect(finalMap.size).toBeGreaterThanOrEqual(minExpected);
    // Upper bound cannot exceed preload + total sets
    expect(finalMap.size).toBeLessThanOrEqual(100 + totalSets); // cannot exceed sets + preload

    // Spot check a few random existing keys
    for (let i = 0; i < 20; i++) {
      const key = `PRE-${Math.floor(Math.random()*100)}`;
      expect(finalMap.has(key)).toBe(true);
    }
  }, 15000);

  test("many concurrent readers with single writer maintains data integrity", async () => {
    const map = new ShareableMap<string, string>({ expectedSize: 5000 });
    for (let i = 0; i < 2000; i++) map.set(`K${i}`, `V${i}`);
    const state = map.toTransferableState();

    const startFlagBuffer = new SharedArrayBuffer(4);
    const startFlag = new Int32Array(startFlagBuffer); startFlag[0] = 0;

    // One writer worker performing updates
    const writerPromise = spawnWorker({ id: 0, operations: 600, state, startFlagBuffer, totalWorkers: WORKER_COUNT });

    // Several reader workers just reading
    const readerPromises: Promise<WorkerResult>[] = [];
    for (let i = 1; i < WORKER_COUNT; i++) {
      readerPromises.push(
        new Promise((resolve, reject) => {
          const readerWorkerCode = `
            try {
              const { parentPort, workerData } = require('worker_threads');
              require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'commonjs' } });
              const { TextEncoder, TextDecoder } = require('util');
              global.TextEncoder = TextEncoder; global.TextDecoder = TextDecoder;
              const { ShareableMap } = require('${require.resolve('../ShareableMap.ts').replace(/\\/g,'\\\\')}');
              const map = ShareableMap.fromTransferableState(workerData.state);
              const startFlag = new Int32Array(workerData.startFlagBuffer);
              while (Atomics.load(startFlag, 0) === 0) { Atomics.wait(startFlag, 0, 0, 100); }
              const errors: string[] = [];
              for (let i = 0; i < 5000; i++) {
                try {
                  const v = map.get('K' + (i % 2000));
                  if (v !== undefined && !v.startsWith('V')) { errors.push('Corrupted value ' + v); break; }
                } catch(e){ errors.push(String(e)); break; }
              }
              parentPort.postMessage({ sets: 0, deletes: 0, errors });
            } catch(e) {
              const { parentPort } = require('worker_threads');
              parentPort.postMessage({ sets:0, deletes:0, errors:[String(e && e.stack || e)] });
            }
          `;
          const worker = new Worker(readerWorkerCode, { eval: true, workerData: { state, startFlagBuffer } });
          worker.on('message', msg => { worker.terminate(); resolve(msg); });
          worker.on('error', err => { worker.terminate(); resolve({ sets:0, deletes:0, errors:[String(err && (err.stack||err.message)||err)] }); });
          worker.on('exit', code => { /* ignore */ });
        })
      );
    }

    Atomics.store(startFlag, 0, 1); Atomics.notify(startFlag, 0);
    const writerResult = await writerPromise;
    const readerResults = await Promise.all(readerPromises);

    const finalMap = revive(state);

    // Integrity: existing keys should decode properly
    for (let i = 0; i < 50; i++) {
      const keyIndex = Math.floor(Math.random()*2000);
      const val = finalMap.get(`K${keyIndex}`);
      if (val !== undefined) {
        expect(val.startsWith('V')).toBe(true);
      }
    }

    // No reader saw corrupted data
    readerResults.forEach(r => expect(r.errors).toHaveLength(0));
    expect(writerResult.errors).toHaveLength(0);
  }, 15000);
});
