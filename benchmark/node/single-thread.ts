import { ShareableMap } from '../../src/index';

export interface BenchmarkResult {
  label: string;
  opsCount: number;
  elapsedMs: number;
  opsPerSec: number;
}

function randomString(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function time(fn: () => void): number {
  const start = performance.now();
  fn();
  return performance.now() - start;
}

function makeResult(label: string, opsCount: number, elapsedMs: number): BenchmarkResult {
  return {
    label,
    opsCount,
    elapsedMs,
    opsPerSec: Math.round(opsCount / (elapsedMs / 1000))
  };
}

export function runSingleThreadBenchmark(): BenchmarkResult[] {
  const DATASET_SIZE = 300_000;

  const pairs: [string, string][] = Array.from({ length: DATASET_SIZE }, () => [
    randomString(),
    randomString()
  ]);

  // Warm-up: avoids JIT cold-start skewing the first measured run
  {
    const w = new ShareableMap<string, string>({ expectedSize: 200 });
    for (let i = 0; i < 200; i++) w.set(`k${i}`, `v${i}`);
    for (let i = 0; i < 200; i++) w.get(`k${i}`);
  }

  const results: BenchmarkResult[] = [];

  // ----- ShareableMap -----
  const sm = new ShareableMap<string, string>({ expectedSize: DATASET_SIZE });

  results.push(makeResult(
    'ShareableMap.set', DATASET_SIZE,
    time(() => { for (const [k, v] of pairs) sm.set(k, v); })
  ));
  results.push(makeResult(
    'ShareableMap.has', DATASET_SIZE,
    time(() => { for (const [k] of pairs) sm.has(k); })
  ));
  results.push(makeResult(
    'ShareableMap.get', DATASET_SIZE,
    time(() => { for (const [k] of pairs) sm.get(k); })
  ));
  results.push(makeResult(
    'ShareableMap.delete', DATASET_SIZE,
    time(() => { for (const [k] of pairs) sm.delete(k); })
  ));

  // ----- native Map -----
  const nm = new Map<string, string>();

  results.push(makeResult(
    'Map.set', DATASET_SIZE,
    time(() => { for (const [k, v] of pairs) nm.set(k, v); })
  ));
  results.push(makeResult(
    'Map.has', DATASET_SIZE,
    time(() => { for (const [k] of pairs) nm.has(k); })
  ));
  results.push(makeResult(
    'Map.get', DATASET_SIZE,
    time(() => { for (const [k] of pairs) nm.get(k); })
  ));
  results.push(makeResult(
    'Map.delete', DATASET_SIZE,
    time(() => { for (const [k] of pairs) nm.delete(k); })
  ));

  return results;
}
