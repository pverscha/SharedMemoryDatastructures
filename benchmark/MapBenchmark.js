class MapBenchmark {
    keyValuePairs = [];
    repetitionFactor = 20;
    mapSizeSteps;

    constructor(
        keyGenerator,
        valueGenerator,
        mapSizeSteps = [1000, 10000, 50000, 250000, 1000000]
    ) {
        this.mapSizeSteps = mapSizeSteps;

        for (let i = 0; i < mapSizeSteps[mapSizeSteps.length - 1]; i++) {
            this.keyValuePairs.push(
                [
                    keyGenerator(),
                    valueGenerator()
                ]
            )
        }
    }


    /**
     * Run the complete benchmark test suite and print the results to the console.
     *
     * @param map Empty map object for which performance needs to be tested.
     */
    runBenchmark(mapConstructor) {
        for (const stepSize of this.mapSizeSteps) {
            console.log("Benchmarking with " + stepSize + " elements.");
            const insertElapsed = [];
            const retrievalElapsed = [];
            const deletionElapsed = [];

            for (let i = 0; i < this.repetitionFactor; i++) {
                const map = mapConstructor();
                const subset = this.getSubsetAndShuffle(this.keyValuePairs, stepSize);

                const startInsert = new Date().getTime();
                this.benchmarkInsertion(map, subset);
                const stopInsert = new Date().getTime();
                insertElapsed.push(stopInsert - startInsert);

                this.benchmarkRetrieval(map, subset);
                const stopRetrieval = new Date().getTime();
                retrievalElapsed.push(stopRetrieval - stopInsert);

                // this.benchmarkDeletion(map, subset);
                // const stopDeletion = new Date().getTime();
                // deletionElapsed.push(stopDeletion - stopRetrieval);
            }

            console.log(`Average insertion time for stepSize ${stepSize} is ${this.computeAverage(insertElapsed)} ms`);
            console.log(`Average retrieval time for stepSize ${stepSize} is ${this.computeAverage(retrievalElapsed)} ms`);
            // console.log(`Average deletion time for stepSize ${stepSize} is ${this.computeAverage(deletionElapsed)} ms`);
        }
    }

    benchmarkInsertion(map, items) {
        for (const [key, value] of items) {
            map.set(key, value);
        }
    }

    benchmarkRetrieval(map, items) {
        for (const [key, value] of items) {
            map.get(key);
        }
    }

    benchmarkDeletion(map, items) {
        for (const [key, value] of items) {
            map.delete(key);
        }
    }

    getSubsetAndShuffle(list, n) {
        for (let i = list.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = list[i];
            list[i] = list[j];
            list[j] = temp;
        }

        return list.slice(0, n);
    }

    computeAverage(list) {
        const sum = list.reduce((acc, current) => acc + current, 0);
        return sum / list.length;
    }
}

module.exports = MapBenchmark;
