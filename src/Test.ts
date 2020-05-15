import ShareableMap from "./ShareableMap";

const iterations = 100000;

const randomKeys = [];
const randomValues = [];

for (let i = 0; i < iterations; i++) {
    randomKeys.push(Math.random().toString(36).substring(7));
    randomValues.push(Math.random().toString(36).substring(60));
}

const startShareable = new Date().getTime();
const shareableMap: Map<string, string> = new ShareableMap<string, string>(iterations);
for (let i = 0; i < iterations; i++) {
    shareableMap.set(randomKeys[i], randomValues[i]);
}

const resultsShareable = [];
for (const [key, value] of shareableMap) {
    resultsShareable.push(key);
    resultsShareable.push(value);
}

const endShareable = new Date().getTime();
console.log("Time shareable: " + (endShareable - startShareable) / 1000 + "s");
//
// const startDefault = new Date().getTime();
// const defaultMap: Map<string, string> = new Map<string, string>();
// for (let i = 0; i < iterations; i++) {
//     defaultMap.set(randomKeys[i], randomValues[i]);
// }
//
// const resultsDefault = [];
// for (const [key, value] of defaultMap) {
//     resultsDefault.push(key);
//     resultsDefault.push(value);
// }
//
// const endDefault = new Date().getTime();
// console.log("Time default: " + (endDefault - startDefault) / 1000 + "s");



