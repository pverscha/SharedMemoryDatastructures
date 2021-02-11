const MapBenchmark = require("./MapBenchmark.js");
const ShareableMap = require("./../dist/bundle.js");

function generator() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

console.log("Performing performance measurements for default JS Map...");
const defaultBench = new MapBenchmark(generator, generator);
defaultBench.runBenchmark(() => new Map());

console.log("Performing performance measurement+s for default shared memory Map...");
const sharedBench = new MapBenchmark(generator, generator, [1000, 10000, 50000]);
sharedBench.runBenchmark(() => new ShareableMap.ShareableMap());
