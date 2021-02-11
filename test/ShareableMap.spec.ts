import ShareableMap from "./../src/map/ShareableMap";

describe("ShareableMap", function () {
    let keyValuePairs: [string, string][];

    beforeAll(() => {
        function generator() {
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }

        keyValuePairs = []
        for (let i = 0; i < 50000; i++) {
            keyValuePairs.push([generator(), generator()]);
        }
    });


    it("correctly sets items without throwing an exception", () => {
        const map = new ShareableMap<string, string>();
        for (const [key, value] of keyValuePairs) {
            map.set(key, value);
        }
    });

    it("correctly retrieves previously set items", () => {
        const map = new ShareableMap<string, string>();
        for (const [key, value] of keyValuePairs) {
            map.set(key, value);
        }

        for (const [key, value] of keyValuePairs) {
            expect(map.get(key)).toBe(value);
        }
    });
});
