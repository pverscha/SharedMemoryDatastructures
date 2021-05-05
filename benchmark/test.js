const ShareableMap = require("./../dist/bundle.js");

const util = require("util");

const map = new ShareableMap.ShareableMap(8, 32);
map.set("a", 87);
console.log(map.get("a"));
map.set("b", "dit is een lange string met veel tekens.");
console.log(map.get("a"));
console.log(map.get("b"));
map.set("a", "blub");
console.log(map.get("a"));
map.set("a", "Een beetje data hier zo graag?!!");
console.log(map.get("a"));
map.set("a", "Dit is weeral een vrij lange string waardoor we gaan moeten verdubbelen in geheugen!");
console.log(map.get("a"));
console.log(map.delete("a"));
console.log(map.get("a"));
