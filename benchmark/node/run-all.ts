import { runSingleThreadBenchmark } from './single-thread';
import type { BenchmarkResult } from './single-thread';
import { runConcurrentBenchmark } from './concurrent';
import type { ConcurrentRunResult } from './concurrent';

// Parse optional --runs flag (default: 5)
const args = process.argv.slice(2);
const runsIdx = args.indexOf('--runs');
const RUNS = runsIdx !== -1 ? Math.max(1, parseInt(args[runsIdx + 1], 10)) : 5;

function avg(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function fmtOps(n: number, width = 18): string {
  return `${n.toLocaleString('en-US')} ops/s`.padStart(width);
}

function fmtMs(n: number, width = 12): string {
  return `${n.toFixed(1)} ms`.padStart(width);
}

function clearLine(): void {
  process.stdout.write('\r' + ' '.repeat(40) + '\r');
}

async function main() {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const W = 72;
  const divider = '='.repeat(W);
  const sub = '-'.repeat(W);

  console.log(`\n${divider}`);
  console.log(`  ShareableMap Benchmark Results`);
  console.log(`  ${timestamp}  |  ${RUNS} run(s), averaged`);
  console.log(divider);

  // ====================================================================
  // Benchmark 1: Single-thread
  // ====================================================================
  console.log('\n[1/2] Single-thread benchmark\n');

  const stRuns: BenchmarkResult[][] = [];
  for (let i = 0; i < RUNS; i++) {
    process.stdout.write(`  Run ${i + 1} / ${RUNS}...`);
    stRuns.push(runSingleThreadBenchmark());
    clearLine();
  }

  // Average each label across all runs
  const stLabels = stRuns[0].map(r => r.label);
  const stAvg = stLabels.map(label => {
    const matching = stRuns.map(run => run.find(r => r.label === label)!);
    const opsCount = matching[0].opsCount;
    const elapsedMs = avg(matching.map(r => r.elapsedMs));
    return {
      label,
      opsCount,
      elapsedMs,
      opsPerSec: Math.round(opsCount / (elapsedMs / 1000))
    };
  });

  const dsK = (stAvg[0].opsCount / 1_000).toFixed(0);
  console.log(`Single-thread — ShareableMap vs native Map  (${dsK} K ops per operation)`);
  console.log(sub);
  console.log(
    'Operation'.padEnd(12) +
    'ShareableMap'.padStart(20) +
    'native Map'.padStart(20) +
    'Overhead'.padStart(12)
  );
  console.log(sub);

  for (const op of ['set', 'has', 'get', 'delete']) {
    const sm = stAvg.find(r => r.label === `ShareableMap.${op}`)!;
    const nm = stAvg.find(r => r.label === `Map.${op}`)!;
    const overhead = (nm.opsPerSec / sm.opsPerSec).toFixed(2);
    console.log(
      op.padEnd(12) +
      fmtOps(sm.opsPerSec, 20) +
      fmtOps(nm.opsPerSec, 20) +
      `  ${overhead}×`.padStart(12)
    );
  }

  // ====================================================================
  // Benchmark 2: Concurrent
  // ====================================================================
  console.log('\n[2/2] Concurrent benchmark\n');

  const concRuns: ConcurrentRunResult[] = [];
  for (let i = 0; i < RUNS; i++) {
    process.stdout.write(`  Run ${i + 1} / ${RUNS}...`);
    concRuns.push(await runConcurrentBenchmark());
    clearLine();
  }

  const totalOps = concRuns[0].totalOps;
  const roleOrder = concRuns[0].workers.map(w => w.role);

  console.log(`Concurrent — 3 workers, ${(totalOps / 1_000).toFixed(0)} K total ops`);
  console.log(sub);
  console.log(
    'Worker'.padEnd(20) +
    'Ops'.padStart(8) +
    'Avg elapsed'.padStart(14) +
    'Throughput'.padStart(20)
  );
  console.log(sub);

  for (const role of roleOrder) {
    const perRole = concRuns.map(r => r.workers.find(w => w.role === role)!);
    const opsCompleted = perRole[0].opsCompleted;
    const avgElapsed = avg(perRole.map(w => w.elapsedMs));
    const avgOpsPerSec = Math.round(opsCompleted / (avgElapsed / 1000));

    console.log(
      role.padEnd(20) +
      opsCompleted.toLocaleString('en-US').padStart(8) +
      fmtMs(avgElapsed, 14) +
      fmtOps(avgOpsPerSec, 20)
    );
  }

  const avgWall = avg(concRuns.map(r => r.wallClockMs));
  const avgTotalOpsPerSec = Math.round(totalOps / (avgWall / 1000));

  console.log(sub);
  console.log(
    `Total wall-clock: ${avgWall.toFixed(1)} ms` +
    `  (${avgTotalOpsPerSec.toLocaleString('en-US')} combined ops/s)`
  );

  console.log(`\n${divider}\n`);
}

main().catch(err => {
  console.error('\nBenchmark failed:', err);
  process.exit(1);
});
