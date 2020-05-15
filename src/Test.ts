import ShareableMap from "./ShareableMap";

const map: ShareableMap<string, string> = new ShareableMap<string, string>(4);
map.set("Test", "Dit is een string...");
map.set("Tester", "Value 2");
map.set("Hupla", "Value 3");
map.set("Value 4", "Testier");

for (const [k, v] of map) {
    console.log("Key is " + k + " and value is " + v);
}

