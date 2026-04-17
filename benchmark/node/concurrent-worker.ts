// Worker thread for the concurrent benchmark.
// Imported directly from ShareableMap to avoid the barrel (src/index.ts)
// which uses directory imports that Node.js ESM cannot resolve when tsx is
// loaded via --import tsx/esm in a spawned worker thread.
import { workerData, parentPort } from 'worker_threads';
import { ShareableMap } from '../../src/map/ShareableMap.ts';
import type { TransferableState } from '../../src/TransferableState.ts';

type WorkerRole = 'reader' | 'writer' | 'mixed';

interface WorkerConfig {
  role: WorkerRole;
  state: TransferableState;
  opsCount: number;
  initialKeyCount: number;
}

function randomValue(): string {
  return Math.random().toString(36).substring(2, 15);
}

const { role, state, opsCount, initialKeyCount } = workerData as WorkerConfig;
const map = ShareableMap.fromTransferableState<string, string>(state);

// Signal that setup is complete and the worker is ready for the 'start' command.
parentPort!.postMessage({ status: 'ready' });

parentPort!.once('message', (msg: { cmd: string }) => {
  if (msg.cmd !== 'start') return;

  const start = performance.now();
  let newKeyCounter = 0;

  for (let i = 0; i < opsCount; i++) {
    const rand = Math.random();
    const existingKey = `entry-${Math.floor(Math.random() * initialKeyCount)}`;

    if (role === 'reader') {
      // 60 % get · 30 % has · 10 % set (new cache entries)
      if (rand < 0.60) {
        map.get(existingKey);
      } else if (rand < 0.90) {
        map.has(existingKey);
      } else {
        map.set(`reader-cache-${newKeyCounter++}`, randomValue());
      }
    } else if (role === 'writer') {
      // 50 % set (new keys) · 30 % delete · 20 % get
      if (rand < 0.50) {
        map.set(`writer-new-${newKeyCounter++}`, randomValue());
      } else if (rand < 0.80) {
        map.delete(existingKey);
      } else {
        map.get(existingKey);
      }
    } else {
      // mixed: 40 % get · 35 % set (updates) · 25 % delete
      if (rand < 0.40) {
        map.get(existingKey);
      } else if (rand < 0.75) {
        map.set(existingKey, randomValue());
      } else {
        map.delete(existingKey);
      }
    }
  }

  const elapsedMs = performance.now() - start;

  parentPort!.postMessage({
    status: 'done',
    stats: {
      role,
      opsCompleted: opsCount,
      elapsedMs,
      opsPerSec: Math.round(opsCount / (elapsedMs / 1000))
    }
  });
});
