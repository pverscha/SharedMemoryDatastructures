// Web Worker script for the HTML concurrent benchmark.
// Loaded as an ES module via new Worker('/benchmark/concurrent-map-worker.js', { type: 'module' }).
import { ShareableMap } from '/src/index.ts';

let map;
let config;

function randomValue() {
    return Math.random().toString(36).substring(2, 15);
}

self.onmessage = function (event) {
    const msg = event.data;

    if (msg.cmd === 'setup') {
        config = msg;
        map = ShareableMap.fromTransferableState(config.state);
        self.postMessage({ status: 'ready' });
        return;
    }

    if (msg.cmd === 'start') {
        const { role, opsCount, initialKeyCount } = config;
        const start = performance.now();
        let newKeyCounter = 0;

        for (let i = 0; i < opsCount; i++) {
            const rand = Math.random();
            const existingKey = `entry-${Math.floor(Math.random() * initialKeyCount)}`;

            if (role === 'reader') {
                // 60 % get · 30 % has · 10 % set (new cache keys)
                if (rand < 0.60) {
                    map.get(existingKey);
                } else if (rand < 0.90) {
                    map.has(existingKey);
                } else {
                    map.set(`reader-cache-${newKeyCounter++}`, randomValue());
                }
            } else if (role === 'writer') {
                // 50 % set (new) · 30 % delete · 20 % get
                if (rand < 0.50) {
                    map.set(`writer-new-${newKeyCounter++}`, randomValue());
                } else if (rand < 0.80) {
                    map.delete(existingKey);
                } else {
                    map.get(existingKey);
                }
            } else {
                // mixed: 40 % get · 35 % set (update) · 25 % delete
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

        self.postMessage({
            status: 'done',
            role,
            opsCompleted: opsCount,
            elapsedMs,
            opsPerSec: Math.round(opsCount / (elapsedMs / 1000))
        });
    }
};
