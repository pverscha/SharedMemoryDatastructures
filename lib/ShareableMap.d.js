"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _Symbol$iterator;

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function () { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

_Symbol$iterator = Symbol.iterator;

var ShareableMap = /*#__PURE__*/function (_Map) {
  (0, _inherits2["default"])(ShareableMap, _Map);

  var _super = _createSuper(ShareableMap);

  function ShareableMap() {
    var _this;

    (0, _classCallCheck2["default"])(this, ShareableMap);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "index", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "data", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "indexView", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "dataView", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "increaseSize", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "storeDataBlock", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "updateLinkedPointer", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "findValue", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "readKeyFromDataObject", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "readValueFromDataObject", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "reset", void 0);
    return _this;
  }

  return ShareableMap;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(Map));

exports["default"] = ShareableMap;
(0, _defineProperty2["default"])(ShareableMap, "LOAD_FACTOR", void 0);
(0, _defineProperty2["default"])(ShareableMap, "INT_SIZE", void 0);
(0, _defineProperty2["default"])(ShareableMap, "INVALID_VALUE", void 0);
(0, _defineProperty2["default"])(ShareableMap, "DATA_OBJECT_OFFSET", void 0);
(0, _defineProperty2["default"])(ShareableMap, "INDEX_TABLE_OFFSET", void 0);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TaGFyZWFibGVNYXAuZC50cyJdLCJuYW1lcyI6WyJTeW1ib2wiLCJpdGVyYXRvciIsIlNoYXJlYWJsZU1hcCIsIk1hcCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBaUJLQSxNQUFNLENBQUNDLFE7O0lBakJTQyxZOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0RBQTJCQyxHOzs7aUNBQTNCRCxZO2lDQUFBQSxZO2lDQUFBQSxZO2lDQUFBQSxZO2lDQUFBQSxZIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hhcmVhYmxlTWFwPEssIFY+IGV4dGVuZHMgTWFwPEssIFY+IHtcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBMT0FEX0ZBQ1RPUjtcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBJTlRfU0laRTtcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBJTlZBTElEX1ZBTFVFO1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IERBVEFfT0JKRUNUX09GRlNFVDtcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBJTkRFWF9UQUJMRV9PRkZTRVQ7XG4gICAgcHJpdmF0ZSBpbmRleDtcbiAgICBwcml2YXRlIGRhdGE7XG4gICAgcHJpdmF0ZSBpbmRleFZpZXc7XG4gICAgcHJpdmF0ZSBkYXRhVmlldztcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3QgYSBuZXcgU2hhcmVhYmxlTWFwLlxuICAgICAqXG4gICAgICogQHBhcmFtIGV4cGVjdGVkU2l6ZSBIb3cgbWFueSBpdGVtcyBhcmUgZXhwZWN0ZWQgdG8gYmUgc3RvcmVkIGluIHRoaXMgbWFwPyBTZXR0aW5nIHRoaXMgdG8gYSBnb29kIGVzdGltYXRlIGZyb21cbiAgICAgKiB0aGUgYmVnaW5uaW5nIGlzIGltcG9ydGFudCBub3QgdG8gdHJhc2ggcGVyZm9ybWFuY2UuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZXhwZWN0ZWRTaXplPzogbnVtYmVyKTtcbiAgICBbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYWJsZUl0ZXJhdG9yPFtLLCBWXT47XG4gICAgZW50cmllcygpOiBJdGVyYWJsZUl0ZXJhdG9yPFtLLCBWXT47XG4gICAga2V5cygpOiBJdGVyYWJsZUl0ZXJhdG9yPEs+O1xuICAgIHZhbHVlcygpOiBJdGVyYWJsZUl0ZXJhdG9yPFY+O1xuICAgIGNsZWFyKGV4cGVjdGVkU2l6ZT86IG51bWJlcik6IHZvaWQ7XG4gICAgZGVsZXRlKGtleTogSyk6IGJvb2xlYW47XG4gICAgZm9yRWFjaChjYWxsYmFja2ZuOiAodmFsdWU6IFYsIGtleTogSywgbWFwOiBNYXA8SywgVj4pID0+IHZvaWQsIHRoaXNBcmc/OiBhbnkpOiB2b2lkO1xuICAgIGdldChrZXk6IEspOiBWIHwgdW5kZWZpbmVkO1xuICAgIGhhcyhrZXk6IEspOiBib29sZWFuO1xuICAgIHNldChrZXk6IEssIHZhbHVlOiBWKTogdGhpcztcbiAgICBnZXQgc2l6ZSgpOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBnZXQgYnVja2V0cygpO1xuICAgIHByaXZhdGUgZ2V0IGZyZWVTdGFydCgpO1xuICAgIHByaXZhdGUgc2V0IGZyZWVTdGFydCh2YWx1ZSk7XG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICogSGVscGVyIG1ldGhvZHMgdGhhdCByZWFkIC8gd3JpdGUgYmluYXJ5IGRhdGFcbiAgICAgKiB0byB0aGUgYXJyYXkgYnVmZmVycy5cbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gICAgcHJpdmF0ZSBpbmNyZWFzZVNpemU7XG4gICAgcHJpdmF0ZSBzdG9yZURhdGFCbG9jaztcbiAgICBwcml2YXRlIHVwZGF0ZUxpbmtlZFBvaW50ZXI7XG4gICAgcHJpdmF0ZSBmaW5kVmFsdWU7XG4gICAgcHJpdmF0ZSByZWFkS2V5RnJvbURhdGFPYmplY3Q7XG4gICAgcHJpdmF0ZSByZWFkVmFsdWVGcm9tRGF0YU9iamVjdDtcbiAgICBwcml2YXRlIHJlc2V0O1xufVxuIl19