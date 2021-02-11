const benchmark = require("benchmark");
const shareableMap = require("../dist/bundle.js");

function randomStringGenerator() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// First test insertion speed of HashMap's
let suite = new benchmark.Suite("HashMap insertion");

const keyValuePairs = [];

for (let i = 0; i < 100000; i++) {
    keyValuePairs.push([randomStringGenerator(), randomStringGenerator()]);
}

suite.add("ShareableMap#Set", function() {
    const sharedMemMap = new shareableMap.ShareableMap(keyValuePairs.length);
    for (const [key, value] of keyValuePairs) {
        sharedMemMap.set(key, value);
    }
}).add("DefaultMap#Set", function() {
    const defaultMap = new Map();
    for (const [key, value] of keyValuePairs) {
        defaultMap.set(key, value);
    }
})
.on("cycle", function(event) {
    console.log(String(event.target));
})
.run({ "async": false });

suite = new benchmark.Suite("HashMap retrieval");

const sharedMemMap = new shareableMap.ShareableMap();
const defaultMap = new Map();

for (const [key, value] of keyValuePairs) {
    sharedMemMap.set(key, value);
    defaultMap.set(key, value);
}

suite.add("ShareableMap#Get", function() {
    for (const [key, value] of keyValuePairs) {
        sharedMemMap.get(key);
    }
}).add("DefaultMap#Get", function() {
    for (const [key, value] of keyValuePairs) {
        defaultMap.get(key);
    }
})
.on("cycle", function(event) {
    console.log(String(event.target));
})
.run({ "async": false });
