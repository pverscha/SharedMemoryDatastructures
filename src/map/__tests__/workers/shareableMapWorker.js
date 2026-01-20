// Worker script performing mixed operations on a ShareableMap
// Uses ts-node to load TypeScript source directly.
require('ts-node').register({transpileOnly: true, compilerOptions: {module: 'commonjs'}});
const {parentPort, workerData} = require('worker_threads');
const {TextEncoder, TextDecoder} = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const {ShareableMap} = require(workerData.shareableMapPath);

try {
    const map = ShareableMap.fromTransferableState(workerData.state);

    const startFlag = new Int32Array(workerData.startFlagBuffer);
    while (Atomics.load(startFlag, 0) === 0) {
        Atomics.wait(startFlag, 0, 0, 100);
    }

    let sets = 0, deletes = 0;
    const errors = [];

    function randStr() {
        return Math.random().toString(36).slice(2);
    }

    const deadlineMs = workerData.internalDeadlineMs || 15000;
    const deadline = Date.now() + deadlineMs;

    for (let i = 0; i < workerData.operations; i++) {
        if (Date.now() > deadline) {
            errors.push('Worker exceeded internal deadline');
            break;
        }
        // Keep track of the amount of random strings that have already been used so we can figure out how much
        // the map has actually grown
        const usedRandomStrings = new Set();
        const mode = i % 10;
        try {
            // Perfom 70% writes, 20% reads, 10% deletes
            // TODO figure out how we can correctly count the exact amount of sets that have been performed and update
            // TODO the tests accordingly
            if (mode < 7) {
                const k = 'W' + workerData.id + '-' + randStr();
                map.set(k, 'V' + workerData.id + '-' + randStr());
                sets++;
            } else if (mode < 9) {
                const k = 'W' + Math.floor(Math.random() * workerData.totalWorkers) + '-' + randStr();
                map.get(k);
            } else {
                const k = 'W' + workerData.id + '-' + randStr();
                map.delete(k);
                deletes++;
            }
        } catch (e) {
            errors.push(String(e));
        }
    }

    parentPort.postMessage({sets, deletes, errors});
} catch (e) {
    parentPort.postMessage({sets: 0, deletes: 0, errors: [String(e && e.stack || e)]});
}

