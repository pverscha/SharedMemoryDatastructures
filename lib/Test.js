"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _ShareableMap = _interopRequireDefault(require("./ShareableMap"));

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var map = new _ShareableMap["default"](4);
map.set("Test", "Dit is een string...");
map.set("Tester", "Value 2");
map.set("Hupla", "Value 3");
map.set("Value 4", "Testier");

var _iterator = _createForOfIteratorHelper(map),
    _step;

try {
  for (_iterator.s(); !(_step = _iterator.n()).done;) {
    var _step$value = (0, _slicedToArray2["default"])(_step.value, 2),
        k = _step$value[0],
        v = _step$value[1];

    console.log("Key is " + k + " and value is " + v);
  } // console.log(map.get("Test"));
  // console.log(map.has("Tester"));
  // console.log(map.has("Blubber"));
  // console.log(map.get("Hupla"));
  // console.log(map.get("Value 4"));
  //
  // console.log(map.size);

} catch (err) {
  _iterator.e(err);
} finally {
  _iterator.f();
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9UZXN0LnRzIl0sIm5hbWVzIjpbIm1hcCIsIlNoYXJlYWJsZU1hcCIsInNldCIsImsiLCJ2IiwiY29uc29sZSIsImxvZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7Ozs7O0FBRUEsSUFBTUEsR0FBaUMsR0FBRyxJQUFJQyx3QkFBSixDQUFpQyxDQUFqQyxDQUExQztBQUNBRCxHQUFHLENBQUNFLEdBQUosQ0FBUSxNQUFSLEVBQWdCLHNCQUFoQjtBQUNBRixHQUFHLENBQUNFLEdBQUosQ0FBUSxRQUFSLEVBQWtCLFNBQWxCO0FBQ0FGLEdBQUcsQ0FBQ0UsR0FBSixDQUFRLE9BQVIsRUFBaUIsU0FBakI7QUFDQUYsR0FBRyxDQUFDRSxHQUFKLENBQVEsU0FBUixFQUFtQixTQUFuQjs7MkNBRXFCRixHOzs7O0FBQXJCLHNEQUEwQjtBQUFBO0FBQUEsUUFBZEcsQ0FBYztBQUFBLFFBQVhDLENBQVc7O0FBQ3RCQyxJQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxZQUFZSCxDQUFaLEdBQWdCLGdCQUFoQixHQUFtQ0MsQ0FBL0M7QUFDSCxHLENBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU2hhcmVhYmxlTWFwIGZyb20gXCIuL1NoYXJlYWJsZU1hcFwiO1xuXG5jb25zdCBtYXA6IFNoYXJlYWJsZU1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgU2hhcmVhYmxlTWFwPHN0cmluZywgc3RyaW5nPig0KTtcbm1hcC5zZXQoXCJUZXN0XCIsIFwiRGl0IGlzIGVlbiBzdHJpbmcuLi5cIik7XG5tYXAuc2V0KFwiVGVzdGVyXCIsIFwiVmFsdWUgMlwiKTtcbm1hcC5zZXQoXCJIdXBsYVwiLCBcIlZhbHVlIDNcIik7XG5tYXAuc2V0KFwiVmFsdWUgNFwiLCBcIlRlc3RpZXJcIik7XG5cbmZvciAoY29uc3QgW2ssIHZdIG9mIG1hcCkge1xuICAgIGNvbnNvbGUubG9nKFwiS2V5IGlzIFwiICsgayArIFwiIGFuZCB2YWx1ZSBpcyBcIiArIHYpO1xufVxuXG4vLyBjb25zb2xlLmxvZyhtYXAuZ2V0KFwiVGVzdFwiKSk7XG4vLyBjb25zb2xlLmxvZyhtYXAuaGFzKFwiVGVzdGVyXCIpKTtcbi8vIGNvbnNvbGUubG9nKG1hcC5oYXMoXCJCbHViYmVyXCIpKTtcbi8vIGNvbnNvbGUubG9nKG1hcC5nZXQoXCJIdXBsYVwiKSk7XG4vLyBjb25zb2xlLmxvZyhtYXAuZ2V0KFwiVmFsdWUgNFwiKSk7XG4vL1xuLy8gY29uc29sZS5sb2cobWFwLnNpemUpO1xuIl19