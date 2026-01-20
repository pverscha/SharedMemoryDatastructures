import {Worker} from "worker_threads";
import {ShareableMap} from "../ShareableMap";

// TODO: clean up these tests. They don't seem to actually have any proper testing effect!

// Concurrency stress tests for ShareableMap using real worker_threads.
// These tests validate that write locks prevent torn writes and that read locks
// allow concurrent readers without corrupting data.

// Configurable parameters via environment variables
const WORKER_COUNT = parseInt(process.env.MAP_WORKERS || process.env.WORKER_COUNT || "4", 10);
const OPERATIONS_PER_WORKER = parseInt(process.env.MAP_OPS || process.env.OPERATIONS_PER_WORKER || "300", 10);
const PRELOAD_SIZE = parseInt(process.env.MAP_PRELOAD || "100", 10);
const MIXED_TIMEOUT_MS = parseInt(process.env.MAP_MIXED_TIMEOUT || "15000", 10);
const RW_TIMEOUT_MS = parseInt(process.env.MAP_RW_TIMEOUT || "15000", 10);

interface WorkerResult {
    sets: number;
    deletes: number;
    finalSize?: number;
    errors: string[];
}

function spawnWorker(workerData: any): Promise<WorkerResult> {
    return new Promise((resolve) => {
        const workerScript = require.resolve('./workers/shareableMapWorker.js');
        const shareableMapPath = require.resolve('../ShareableMap.ts').replace(/\\/g, '\\\\');
        const worker = new Worker(workerScript, {workerData: {...workerData, shareableMapPath}});
        worker.on('message', msg => {
            worker.terminate();
            resolve(msg);
        });
        worker.on('error', err => {
            worker.terminate();
            resolve({sets: 0, deletes: 0, errors: [String(err && (err.stack || err.message) || err)]});
        });
        worker.on('exit', () => { /* handled */
        });
    });
}

function revive(state: ReturnType<ShareableMap<any, any>["toTransferableState"]>) {
    return ShareableMap.fromTransferableState<string, string>(state);
}

const maybeRun = process.env.STRESS ? describe : describe.skip;

maybeRun("ShareableMap thread safety", () => {
    beforeAll(() => {
        const {TextEncoder, TextDecoder} = require("util");
        (global as any).TextEncoder = TextEncoder;
        (global as any).TextDecoder = TextDecoder;
    });

    test("concurrent mixed operations produce consistent size accounting", async () => {
        const baseMap = new ShareableMap<string, string>({expectedSize: WORKER_COUNT * OPERATIONS_PER_WORKER});

        for (let i = 0; i < PRELOAD_SIZE; i++) {
            baseMap.set(`PRE-${i}`, `VAL-${i}`);
        }

        const state = baseMap.toTransferableState();

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
                    totalWorkers: WORKER_COUNT,
                    internalDeadlineMs: MIXED_TIMEOUT_MS
                })
            );
        }

        Atomics.store(startFlag, 0, 1);
        Atomics.notify(startFlag, 0);

        const results = await Promise.all(workers);
        const totalSets = results.reduce((a, r) => a + r.sets, 0);
        const totalDeletes = results.reduce((a, r) => a + r.deletes, 0);
        const allErrors = results.flatMap(r => r.errors);

        expect(allErrors).toHaveLength(0);

        expect(baseMap.size).toBeGreaterThanOrEqual(PRELOAD_SIZE);
        expect(baseMap.size).toBeLessThanOrEqual(PRELOAD_SIZE + totalSets);

        for (let i = 0; i < Math.min(20, PRELOAD_SIZE); i++) {
            const key = `PRE-${Math.floor(Math.random() * PRELOAD_SIZE)}`;
            expect(baseMap.has(key)).toBe(true);
        }
    }, MIXED_TIMEOUT_MS);

    test("many concurrent readers with single writer maintains data integrity", async () => {
        const map = new ShareableMap<string, string>({expectedSize: 5000});
        for (let i = 0; i < 2000; i++) map.set(`K${i}`, `V${i}`);
        const state = map.toTransferableState();

        const startFlagBuffer = new SharedArrayBuffer(4);
        const startFlag = new Int32Array(startFlagBuffer);
        startFlag[0] = 0;

        const writerPromise = spawnWorker({
            id: 0,
            operations: Math.max(OPERATIONS_PER_WORKER, 600),
            state,
            startFlagBuffer,
            totalWorkers: WORKER_COUNT,
            internalDeadlineMs: RW_TIMEOUT_MS
        });

        const readerPromises: Promise<WorkerResult>[] = [];
        for (let i = 1; i < WORKER_COUNT; i++) {
            readerPromises.push(
                new Promise((resolve) => {
                    const workerScript = require.resolve('./workers/shareableMapWorker.js');
                    const shareableMapPath = require.resolve('../ShareableMap.ts').replace(/\\/g, '\\\\');
                    const worker = new Worker(workerScript, {
                        workerData: {
                            id: i,
                            operations: 0,
                            state,
                            startFlagBuffer,
                            totalWorkers: WORKER_COUNT,
                            shareableMapPath,
                            internalDeadlineMs: RW_TIMEOUT_MS
                        }
                    });
                    worker.on('message', msg => {
                        worker.terminate();
                        resolve(msg);
                    });
                    worker.on('error', err => {
                        worker.terminate();
                        resolve({sets: 0, deletes: 0, errors: [String(err && (err.stack || err.message) || err)]});
                    });
                    worker.on('exit', () => { /* ignore */
                    });
                })
            );
        }

        Atomics.store(startFlag, 0, 1);
        Atomics.notify(startFlag, 0);
        const writerResult = await writerPromise;
        const readerResults = await Promise.all(readerPromises);

        for (let i = 0; i < 50; i++) {
            const keyIndex = Math.floor(Math.random() * 2000);
            const val = map.get(`K${keyIndex}`);
            if (val !== undefined) {
                expect(val.startsWith('V')).toBe(true);
            }
        }

        readerResults.forEach(r => expect(r.errors).toHaveLength(0));
        expect(writerResult.errors).toHaveLength(0);
    }, RW_TIMEOUT_MS);
});
