// Worker script performing mixed operations on a ShareableMap
require('ts-node').register({ transpileOnly: true });
const { parentPort, workerData } = require('worker_threads');
const { ShareableMap } = require('../../ShareableMap.ts');
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder; global.TextDecoder = TextDecoder;

const map = ShareableMap.fromTransferableState(workerData.state);

const startFlag = new Int32Array(workerData.startFlagBuffer);
while (Atomics.load(startFlag, 0) === 0) {
  Atomics.wait(startFlag, 0, 0, 100);
}

let sets = 0; let deletes = 0; const errors = [];
function randStr() { return Math.random().toString(36).slice(2); }

for (let i = 0; i < workerData.operations; i++) {
  const mode = i % 10;
  try {
    if (mode < 7) { // 70% sets
      const k = 'W' + workerData.id + '-' + randStr();
      map.set(k, 'V' + workerData.id + '-' + randStr());
      sets++;
    } else if (mode < 9) { // 20% reads
      const k = 'W' + Math.floor(Math.random() * workerData.totalWorkers) + '-' + randStr();
      map.get(k);
    } else { // 10% deletes
      const k = 'W' + workerData.id + '-' + randStr();
      map.delete(k);
      deletes++;
    }
  } catch (e) {
    errors.push(String(e));
  }
}

parentPort.postMessage({ sets, deletes, errors });
