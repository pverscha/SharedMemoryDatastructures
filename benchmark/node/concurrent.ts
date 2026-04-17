import { Worker } from 'worker_threads';
import { ShareableMap } from '../../src/index';
import type { TransferableState } from '../../src/TransferableState';

// ---------- Types (shared with concurrent-worker.ts) ----------

type WorkerRole = 'reader' | 'writer' | 'mixed';

interface WorkerConfig {
  role: WorkerRole;
  state: TransferableState;
  opsCount: number;
  initialKeyCount: number;
}

export interface WorkerStats {
  role: WorkerRole;
  opsCompleted: number;
  elapsedMs: number;
  opsPerSec: number;
}

export interface ConcurrentRunResult {
  workers: WorkerStats[];
  wallClockMs: number;
  totalOps: number;
  totalOpsPerSec: number;
}

// ---------- Main thread logic ----------

function randomValue(): string {
  return Math.random().toString(36).substring(2, 15);
}

export async function runConcurrentBenchmark(): Promise<ConcurrentRunResult> {
  const INITIAL_KEY_COUNT = 50_000;
  const OPS_PER_WORKER = 30_000;
  const roles: WorkerRole[] = ['reader', 'writer', 'mixed'];

  // Pre-populate the shared map with a known initial state.
  // Each benchmark run starts from an identical baseline.
  const map = new ShareableMap<string, string>({ expectedSize: INITIAL_KEY_COUNT });
  for (let i = 0; i < INITIAL_KEY_COUNT; i++) {
    map.set(`entry-${i}`, randomValue());
  }
  const state = map.toTransferableState();

  // Workers load via a plain JS bootstrap (worker-bootstrap.mjs) which uses
  // tsx's tsImport() to load concurrent-worker.ts. This gives full TypeScript
  // resolution (including extensionless imports) that --import tsx/esm alone
  // does not provide transitively in Node.js v24.
  const workerScript = new URL('./worker-bootstrap.mjs', import.meta.url);

  const workers = roles.map(role =>
    new Worker(workerScript, {
      workerData: {
        role,
        state,
        opsCount: OPS_PER_WORKER,
        initialKeyCount: INITIAL_KEY_COUNT
      } satisfies WorkerConfig
    })
  );

  // Wait until every worker signals that it is ready.
  await Promise.all(workers.map(w =>
    new Promise<void>((resolve, reject) => {
      w.once('message', (msg: { status: string }) => {
        if (msg.status === 'ready') {
          resolve();
        } else {
          reject(new Error(`Unexpected setup message: ${JSON.stringify(msg)}`));
        }
      });
      w.once('error', reject);
    })
  ));

  // Broadcast 'start' to all workers at once and begin wall-clock timing.
  const wallStart = performance.now();
  for (const w of workers) w.postMessage({ cmd: 'start' });

  // Collect the result from each worker.
  const workerStats = await Promise.all(workers.map(w =>
    new Promise<WorkerStats>((resolve, reject) => {
      w.once('message', (msg: { status: string; stats: WorkerStats }) => {
        if (msg.status === 'done') {
          resolve(msg.stats);
        } else {
          reject(new Error(`Unexpected result message: ${JSON.stringify(msg)}`));
        }
      });
      w.once('error', reject);
    })
  ));

  const wallClockMs = performance.now() - wallStart;
  await Promise.all(workers.map(w => w.terminate()));

  const totalOps = workerStats.reduce((sum, s) => sum + s.opsCompleted, 0);

  return {
    workers: workerStats,
    wallClockMs,
    totalOps,
    totalOpsPerSec: Math.round(totalOps / (wallClockMs / 1000))
  };
}
