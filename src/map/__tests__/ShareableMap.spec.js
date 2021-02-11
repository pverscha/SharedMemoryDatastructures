import ShareableMap from "../ShareableMap";
describe("ShareableMap", () => {
    // How many key, value pairs will be generated? Retrieve them again later to check whether the corresponding values
    // are correct.
    const pairAmount = 10000;
    const pairs = [];
    for (let i = 0; i < pairAmount; i++) {
        const key = generateRandomString();
        const value = generateRandomString();
        pairs.push([key, value]);
    }
    beforeAll(() => {
        const { TextEncoder, TextDecoder } = require("util");
        globalThis.TextEncoder = TextEncoder;
        globalThis.TextDecoder = TextDecoder;
    });
    it("should correctly return all values that are stored in the map", () => {
        const map = new ShareableMap();
        for (const [key, value] of pairs) {
            map.set(key, value);
        }
        // Check that all these values are indeed present in the map
        expect(map.size).toEqual(pairAmount);
        for (const [key, value] of pairs) {
            expect(map.has(key)).toBeTruthy();
            const retrievedValue = map.get(key);
            expect(retrievedValue).toEqual(value);
        }
    });
    it("should work with keys that are objects", () => {
        const map = new ShareableMap();
        const key1 = {
            firstName: "John",
            lastName: "Doe"
        };
        map.set(key1, "test");
        expect([...map.keys()]).toEqual([key1]);
        expect(map.get(key1)).toEqual("test");
    });
    it("should work with values that are objects", () => {
        const map = new ShareableMap();
        const value1 = {
            firstName: "John",
            lastName: "Doe"
        };
        map.set("k1", value1);
        expect(map.get("k1")).toEqual(value1);
    });
    it("should work with keys that are numbers", () => {
        const map = new ShareableMap();
        map.set(1, "test");
        map.set(12424, "test1");
        expect(map.get(1)).toEqual("test");
        expect(map.get(12424)).toEqual("test1");
    });
    it("should work with values that are numbers", () => {
        const map = new ShareableMap();
        map.set("k1", 2341);
        map.set("k2", 23478);
        expect(map.get("k1")).toEqual(2341);
        expect(map.get("k2")).toEqual(23478);
        expect(typeof map.get("k1")).toEqual("number");
    });
    // it("should work with keys that are objects containing functions", () => {
    //     const map = new ShareableMap<{ firstName: string, lastName: string, testFunction: () => string }, string>();
    //
    //     const key1 = {
    //         firstName: "John",
    //         lastName: "Doe",
    //         testFunction: () => {
    //             return "something";
    //         }
    //     }
    //
    //     map.set(key1, "test");
    //
    //
    //     expect([...map.keys()]).toEqual([key1]);
    //     expect(map.get(key1)).toEqual("test");
    //     expect([...map.keys()][0].testFunction()).toEqual("something");
    // })
});
function generateRandomString() {
    return Math.random().toString(36).substring(7);
}
//# sourceMappingURL=ShareableMap.spec.js.map