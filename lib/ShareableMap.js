"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _fnvPlus = _interopRequireDefault(require("fnv-plus"));

var _Symbol$iterator;

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function () { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

_Symbol$iterator = Symbol.iterator;

var ShareableMap = /*#__PURE__*/function (_Map) {
  (0, _inherits2["default"])(ShareableMap, _Map);

  var _super = _createSuper(ShareableMap);

  // The default load factor to which this map should adhere
  // How many bytes does one int use? (32 bits at this point)
  // We never use 0 as a valid index value, and thus this number is used to identify free space / unused blocks.
  // How many bytes for a data object are reserved for metadata? (e.g. pointer to next block, key length,
  // value length).

  /**
   * Construct a new ShareableMap.
   *
   * @param expectedSize How many items are expected to be stored in this map? Setting this to a good estimate from
   * the beginning is important not to trash performance.
   */
  function ShareableMap() {
    var _this;

    var expectedSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1024;
    (0, _classCallCheck2["default"])(this, ShareableMap);
    _this = _super.call(this);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "index", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "data", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "indexView", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "dataView", void 0);

    _this.reset(expectedSize);

    return _this;
  }

  (0, _createClass2["default"])(ShareableMap, [{
    key: _Symbol$iterator,
    value: function value() {
      return this.entries();
    }
  }, {
    key: "entries",
    value: /*#__PURE__*/_regenerator["default"].mark(function entries() {
      var i, dataPointer, _key, _value;

      return _regenerator["default"].wrap(function entries$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              i = 0;

            case 1:
              if (!(i < this.buckets)) {
                _context.next = 14;
                break;
              }

              dataPointer = this.indexView.getUint32(ShareableMap.INDEX_TABLE_OFFSET + i * 4);

            case 3:
              if (!(dataPointer !== 0)) {
                _context.next = 11;
                break;
              }

              _key = this.readKeyFromDataObject(dataPointer);
              _value = this.readValueFromDataObject(dataPointer);
              _context.next = 8;
              return [_key, _value];

            case 8:
              dataPointer = this.dataView.getUint32(dataPointer);
              _context.next = 3;
              break;

            case 11:
              i++;
              _context.next = 1;
              break;

            case 14:
            case "end":
              return _context.stop();
          }
        }
      }, entries, this);
    })
  }, {
    key: "keys",
    value: /*#__PURE__*/_regenerator["default"].mark(function keys() {
      var i, dataPointer;
      return _regenerator["default"].wrap(function keys$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              i = 0;

            case 1:
              if (!(i < this.buckets)) {
                _context2.next = 12;
                break;
              }

              dataPointer = this.indexView.getUint32(ShareableMap.INDEX_TABLE_OFFSET + i * 4);

            case 3:
              if (!(dataPointer !== 0)) {
                _context2.next = 9;
                break;
              }

              _context2.next = 6;
              return this.readKeyFromDataObject(dataPointer);

            case 6:
              dataPointer = this.dataView.getUint32(dataPointer);
              _context2.next = 3;
              break;

            case 9:
              i++;
              _context2.next = 1;
              break;

            case 12:
            case "end":
              return _context2.stop();
          }
        }
      }, keys, this);
    })
  }, {
    key: "values",
    value: /*#__PURE__*/_regenerator["default"].mark(function values() {
      var i, dataPointer;
      return _regenerator["default"].wrap(function values$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              i = 0;

            case 1:
              if (!(i < this.buckets)) {
                _context3.next = 12;
                break;
              }

              dataPointer = this.indexView.getUint32(ShareableMap.INDEX_TABLE_OFFSET + i * 4);

            case 3:
              if (!(dataPointer !== 0)) {
                _context3.next = 9;
                break;
              }

              _context3.next = 6;
              return this.readValueFromDataObject(dataPointer);

            case 6:
              dataPointer = this.dataView.getUint32(dataPointer);
              _context3.next = 3;
              break;

            case 9:
              i++;
              _context3.next = 1;
              break;

            case 12:
            case "end":
              return _context3.stop();
          }
        }
      }, values, this);
    })
  }, {
    key: "clear",
    value: function clear() {
      var expectedSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1024;
      this.reset(expectedSize);
    }
  }, {
    key: "delete",
    value: function _delete(key) {
      throw "UnsupportedOperationException";
    }
  }, {
    key: "forEach",
    value: function forEach(callbackfn, thisArg) {
      (0, _get2["default"])((0, _getPrototypeOf2["default"])(ShareableMap.prototype), "forEach", this).call(this, callbackfn, thisArg);
    }
  }, {
    key: "get",
    value: function get(key) {
      var stringKey;

      if (typeof key !== "string") {
        stringKey = JSON.stringify(key);
      } else {
        stringKey = key;
      }

      var hash = _fnvPlus["default"].fast1a32(stringKey); // Bucket in which this value should be stored.


      var bucket = hash % this.buckets * 4;
      var stringVal = this.findValue(this.indexView.getUint32(bucket + ShareableMap.INDEX_TABLE_OFFSET), stringKey); // TODO fix for all types here!

      return stringVal;
    }
  }, {
    key: "has",
    value: function has(key) {
      return this.get(key) !== undefined;
    }
  }, {
    key: "set",
    value: function set(key, value) {
      var stringKey;

      if (typeof key !== "string") {
        stringKey = JSON.stringify(key);
      } else {
        stringKey = key;
      }

      var hash = _fnvPlus["default"].fast1a32(stringKey); // Bucket in which this value should be stored.


      var bucket = hash % this.buckets * 4;
      var nextFree = this.freeStart; // Pointer to next block is empty at this point

      this.storeDataBlock(stringKey, value); // Increase size

      this.increaseSize();
      var bucketPointer = this.indexView.getUint32(bucket + ShareableMap.INDEX_TABLE_OFFSET);

      if (bucketPointer === 0) {
        this.indexView.setUint32(bucket + ShareableMap.INDEX_TABLE_OFFSET, nextFree);
      } else {
        // Update linked list pointers
        this.updateLinkedPointer(bucketPointer, nextFree);
      }

      return this;
    }
  }, {
    key: "increaseSize",

    /***********************************************
     * Helper methods that read / write binary data
     * to the array buffers.
     ***********************************************/
    value: function increaseSize() {
      this.indexView.setUint32(0, this.size + 1);
    }
  }, {
    key: "storeDataBlock",
    value: function storeDataBlock(key, value) {
      var nextFree = this.freeStart;
      var textEncoder = new TextEncoder(); // Store key in data structure

      var keyArray = new Uint8Array(this.data, nextFree + ShareableMap.DATA_OBJECT_OFFSET);
      var writeResult = textEncoder.encodeInto(key, keyArray);
      var keyLength = writeResult.written ? writeResult.written : 0;
      var stringVal;

      if (typeof value !== "string") {
        stringVal = JSON.stringify(value);
      } else {
        stringVal = value;
      }

      var valueArray = new Uint8Array(this.data, nextFree + ShareableMap.DATA_OBJECT_OFFSET + keyLength);
      writeResult = textEncoder.encodeInto(stringVal, valueArray);
      var valueLength = writeResult.written ? writeResult.written : 0; // Store key length

      this.dataView.setUint32(nextFree + 4, keyLength); // Store value length

      this.dataView.setUint32(nextFree + 8, valueLength);
      this.freeStart = nextFree + ShareableMap.DATA_OBJECT_OFFSET + keyLength + valueLength;
    }
  }, {
    key: "updateLinkedPointer",
    value: function updateLinkedPointer(startPos, nextBlock) {
      while (this.dataView.getUint32(startPos) !== 0) {
        startPos = this.dataView.getUint32(startPos);
      }

      this.dataView.setUint32(startPos, nextBlock);
    }
  }, {
    key: "findValue",
    value: function findValue(startPos, key) {
      while (startPos !== 0) {
        var readKey = this.readKeyFromDataObject(startPos);

        if (readKey === key) {
          return this.readValueFromDataObject(startPos);
        } else {
          startPos = this.dataView.getUint32(startPos);
        }
      }

      return undefined;
    }
  }, {
    key: "readKeyFromDataObject",
    value: function readKeyFromDataObject(startPos) {
      var keyLength = this.dataView.getUint32(startPos + 4);
      var textDecoder = new TextDecoder();
      var keyArray = new Uint8Array(this.data, startPos + ShareableMap.DATA_OBJECT_OFFSET, keyLength);
      return textDecoder.decode(keyArray);
    }
  }, {
    key: "readValueFromDataObject",
    value: function readValueFromDataObject(startPos) {
      var keyLength = this.dataView.getUint32(startPos + 4);
      var valueLength = this.dataView.getUint32(startPos + 8);
      var textDecoder = new TextDecoder();
      var valueArray = new Uint8Array(this.data, startPos + ShareableMap.DATA_OBJECT_OFFSET + keyLength, valueLength);
      return textDecoder.decode(valueArray);
    }
  }, {
    key: "reset",
    value: function reset(expectedSize) {
      // First 4 bytes are used to store the amount of items in the map. Second 4 bytes keep track of how many buckets
      // are currently being used. Third set of 4 bytes is used to track where the free space in the data table
      // starts. Rest of the index maps buckets onto their starting position in the data array.
      var buckets = Math.ceil(expectedSize / ShareableMap.LOAD_FACTOR);
      var indexSize = 3 * 4 + buckets * ShareableMap.INT_SIZE;
      this.index = new SharedArrayBuffer(indexSize);
      this.indexView = new DataView(this.index, 0, indexSize); // Set buckets

      this.indexView.setUint32(4, buckets); // Free space starts from position 1 in the data array (instead of 0, which we use to indicate the end).

      this.indexView.setUint32(8, 4); // Reserve 256 bytes per value (since strings are going to be stored in this map).

      this.data = new SharedArrayBuffer(256 * expectedSize);
      this.dataView = new DataView(this.data, 0, 256 * expectedSize);
    }
  }, {
    key: "size",
    get: function get() {
      // Size is being stored in the first 4 bytes of the index table
      return this.indexView.getUint32(0);
    }
  }, {
    key: "buckets",
    get: function get() {
      // Number of buckets is stored in the second integer of the index table
      return this.indexView.getUint32(4);
    }
  }, {
    key: "freeStart",
    get: function get() {
      // At what position in the data table does the free space start?
      return this.indexView.getUint32(8);
    },
    set: function set(position) {
      this.indexView.setUint32(8, position);
    }
  }]);
  return ShareableMap;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(Map));

exports["default"] = ShareableMap;
(0, _defineProperty2["default"])(ShareableMap, "LOAD_FACTOR", 0.75);
(0, _defineProperty2["default"])(ShareableMap, "INT_SIZE", 4);
(0, _defineProperty2["default"])(ShareableMap, "INVALID_VALUE", 0);
(0, _defineProperty2["default"])(ShareableMap, "DATA_OBJECT_OFFSET", 12);
(0, _defineProperty2["default"])(ShareableMap, "INDEX_TABLE_OFFSET", 12);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TaGFyZWFibGVNYXAudHMiXSwibmFtZXMiOlsiU3ltYm9sIiwiaXRlcmF0b3IiLCJTaGFyZWFibGVNYXAiLCJleHBlY3RlZFNpemUiLCJyZXNldCIsImVudHJpZXMiLCJpIiwiYnVja2V0cyIsImRhdGFQb2ludGVyIiwiaW5kZXhWaWV3IiwiZ2V0VWludDMyIiwiSU5ERVhfVEFCTEVfT0ZGU0VUIiwia2V5IiwicmVhZEtleUZyb21EYXRhT2JqZWN0IiwidmFsdWUiLCJyZWFkVmFsdWVGcm9tRGF0YU9iamVjdCIsImRhdGFWaWV3IiwiY2FsbGJhY2tmbiIsInRoaXNBcmciLCJzdHJpbmdLZXkiLCJKU09OIiwic3RyaW5naWZ5IiwiaGFzaCIsImZudiIsImZhc3QxYTMyIiwiYnVja2V0Iiwic3RyaW5nVmFsIiwiZmluZFZhbHVlIiwiZ2V0IiwidW5kZWZpbmVkIiwibmV4dEZyZWUiLCJmcmVlU3RhcnQiLCJzdG9yZURhdGFCbG9jayIsImluY3JlYXNlU2l6ZSIsImJ1Y2tldFBvaW50ZXIiLCJzZXRVaW50MzIiLCJ1cGRhdGVMaW5rZWRQb2ludGVyIiwic2l6ZSIsInRleHRFbmNvZGVyIiwiVGV4dEVuY29kZXIiLCJrZXlBcnJheSIsIlVpbnQ4QXJyYXkiLCJkYXRhIiwiREFUQV9PQkpFQ1RfT0ZGU0VUIiwid3JpdGVSZXN1bHQiLCJlbmNvZGVJbnRvIiwia2V5TGVuZ3RoIiwid3JpdHRlbiIsInZhbHVlQXJyYXkiLCJ2YWx1ZUxlbmd0aCIsInN0YXJ0UG9zIiwibmV4dEJsb2NrIiwicmVhZEtleSIsInRleHREZWNvZGVyIiwiVGV4dERlY29kZXIiLCJkZWNvZGUiLCJNYXRoIiwiY2VpbCIsIkxPQURfRkFDVE9SIiwiaW5kZXhTaXplIiwiSU5UX1NJWkUiLCJpbmRleCIsIlNoYXJlZEFycmF5QnVmZmVyIiwiRGF0YVZpZXciLCJwb3NpdGlvbiIsIk1hcCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7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QUFDQSxXQUFLRSxTQUFMLENBQWUwQixTQUFmLENBQXlCLENBQXpCLEVBQTRCLENBQTVCLEVBWmdDLENBY2hDOztBQUNBLFdBQUtPLElBQUwsR0FBWSxJQUFJb0IsaUJBQUosQ0FBc0IsTUFBTTNELFlBQTVCLENBQVo7QUFDQSxXQUFLYSxRQUFMLEdBQWdCLElBQUkrQyxRQUFKLENBQWEsS0FBS3JCLElBQWxCLEVBQXdCLENBQXhCLEVBQTJCLE1BQU12QyxZQUFqQyxDQUFoQjtBQUNIOzs7d0JBM0hVO0FBQ1A7QUFDQSxhQUFPLEtBQUtNLFNBQUwsQ0FBZUMsU0FBZixDQUF5QixDQUF6QixDQUFQO0FBQ0g7Ozt3QkFFcUI7QUFDbEI7QUFDQSxhQUFPLEtBQUtELFNBQUwsQ0FBZUMsU0FBZixDQUF5QixDQUF6QixDQUFQO0FBQ0g7Ozt3QkFFdUI7QUFDcEI7QUFDQSxhQUFPLEtBQUtELFNBQUwsQ0FBZUMsU0FBZixDQUF5QixDQUF6QixDQUFQO0FBQ0gsSztzQkFFcUJzRCxRLEVBQVU7QUFDNUIsV0FBS3ZELFNBQUwsQ0FBZTBCLFNBQWYsQ0FBeUIsQ0FBekIsRUFBNEI2QixRQUE1QjtBQUNIOzs7a0RBdkoyQ0MsRzs7O2lDQUEzQi9ELFksaUJBRXFCLEk7aUNBRnJCQSxZLGNBSWtCLEM7aUNBSmxCQSxZLG1CQU11QixDO2lDQU52QkEsWSx3QkFTNEIsRTtpQ0FUNUJBLFksd0JBVTRCLEUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZm52IGZyb20gXCJmbnYtcGx1c1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaGFyZWFibGVNYXA8SywgVj4gZXh0ZW5kcyBNYXA8SywgVj4ge1xuICAgIC8vIFRoZSBkZWZhdWx0IGxvYWQgZmFjdG9yIHRvIHdoaWNoIHRoaXMgbWFwIHNob3VsZCBhZGhlcmVcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBMT0FEX0ZBQ1RPUiA9IDAuNzU7XG4gICAgLy8gSG93IG1hbnkgYnl0ZXMgZG9lcyBvbmUgaW50IHVzZT8gKDMyIGJpdHMgYXQgdGhpcyBwb2ludClcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBJTlRfU0laRSA9IDQ7XG4gICAgLy8gV2UgbmV2ZXIgdXNlIDAgYXMgYSB2YWxpZCBpbmRleCB2YWx1ZSwgYW5kIHRodXMgdGhpcyBudW1iZXIgaXMgdXNlZCB0byBpZGVudGlmeSBmcmVlIHNwYWNlIC8gdW51c2VkIGJsb2Nrcy5cbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBJTlZBTElEX1ZBTFVFID0gMDtcbiAgICAvLyBIb3cgbWFueSBieXRlcyBmb3IgYSBkYXRhIG9iamVjdCBhcmUgcmVzZXJ2ZWQgZm9yIG1ldGFkYXRhPyAoZS5nLiBwb2ludGVyIHRvIG5leHQgYmxvY2ssIGtleSBsZW5ndGgsXG4gICAgLy8gdmFsdWUgbGVuZ3RoKS5cbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBEQVRBX09CSkVDVF9PRkZTRVQgPSAxMjtcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBJTkRFWF9UQUJMRV9PRkZTRVQgPSAxMjtcblxuICAgIHByaXZhdGUgaW5kZXghOiBTaGFyZWRBcnJheUJ1ZmZlcjtcbiAgICBwcml2YXRlIGRhdGEhOiBTaGFyZWRBcnJheUJ1ZmZlcjtcblxuICAgIHByaXZhdGUgaW5kZXhWaWV3ITogRGF0YVZpZXc7XG4gICAgcHJpdmF0ZSBkYXRhVmlldyE6IERhdGFWaWV3O1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0IGEgbmV3IFNoYXJlYWJsZU1hcC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBleHBlY3RlZFNpemUgSG93IG1hbnkgaXRlbXMgYXJlIGV4cGVjdGVkIHRvIGJlIHN0b3JlZCBpbiB0aGlzIG1hcD8gU2V0dGluZyB0aGlzIHRvIGEgZ29vZCBlc3RpbWF0ZSBmcm9tXG4gICAgICogdGhlIGJlZ2lubmluZyBpcyBpbXBvcnRhbnQgbm90IHRvIHRyYXNoIHBlcmZvcm1hbmNlLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGV4cGVjdGVkU2l6ZTogbnVtYmVyID0gMTAyNCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnJlc2V0KGV4cGVjdGVkU2l6ZSk7XG4gICAgfVxuXG4gICAgW1N5bWJvbC5pdGVyYXRvcl0oKTogSXRlcmFibGVJdGVyYXRvcjxbSywgVl0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZW50cmllcygpO1xuICAgIH1cblxuICAgICplbnRyaWVzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8W0ssIFZdPiB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5idWNrZXRzOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBkYXRhUG9pbnRlciA9IHRoaXMuaW5kZXhWaWV3LmdldFVpbnQzMihTaGFyZWFibGVNYXAuSU5ERVhfVEFCTEVfT0ZGU0VUICsgaSAqIDQpO1xuICAgICAgICAgICAgd2hpbGUgKGRhdGFQb2ludGVyICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5yZWFkS2V5RnJvbURhdGFPYmplY3QoZGF0YVBvaW50ZXIpIGFzIHVua25vd24gYXMgSztcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMucmVhZFZhbHVlRnJvbURhdGFPYmplY3QoZGF0YVBvaW50ZXIpIGFzIHVua25vd24gYXMgVjtcbiAgICAgICAgICAgICAgICB5aWVsZCBba2V5LCB2YWx1ZV07XG4gICAgICAgICAgICAgICAgZGF0YVBvaW50ZXIgPSB0aGlzLmRhdGFWaWV3LmdldFVpbnQzMihkYXRhUG9pbnRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAqa2V5cygpOiBJdGVyYWJsZUl0ZXJhdG9yPEs+IHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmJ1Y2tldHM7IGkrKykge1xuICAgICAgICAgICAgbGV0IGRhdGFQb2ludGVyID0gdGhpcy5pbmRleFZpZXcuZ2V0VWludDMyKFNoYXJlYWJsZU1hcC5JTkRFWF9UQUJMRV9PRkZTRVQgKyBpICogNCk7XG4gICAgICAgICAgICB3aGlsZSAoZGF0YVBvaW50ZXIgIT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPIGZpeCB0eXBlcyBoZXJlXG4gICAgICAgICAgICAgICAgeWllbGQgdGhpcy5yZWFkS2V5RnJvbURhdGFPYmplY3QoZGF0YVBvaW50ZXIpIGFzIHVua25vd24gYXMgSztcbiAgICAgICAgICAgICAgICBkYXRhUG9pbnRlciA9IHRoaXMuZGF0YVZpZXcuZ2V0VWludDMyKGRhdGFQb2ludGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgICp2YWx1ZXMoKTogSXRlcmFibGVJdGVyYXRvcjxWPiB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5idWNrZXRzOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBkYXRhUG9pbnRlciA9IHRoaXMuaW5kZXhWaWV3LmdldFVpbnQzMihTaGFyZWFibGVNYXAuSU5ERVhfVEFCTEVfT0ZGU0VUICsgaSAqIDQpO1xuICAgICAgICAgICAgd2hpbGUgKGRhdGFQb2ludGVyICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETyBmaXggdHlwZXMgaGVyZVxuICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMucmVhZFZhbHVlRnJvbURhdGFPYmplY3QoZGF0YVBvaW50ZXIpIGFzIHVua25vd24gYXMgVjtcbiAgICAgICAgICAgICAgICBkYXRhUG9pbnRlciA9IHRoaXMuZGF0YVZpZXcuZ2V0VWludDMyKGRhdGFQb2ludGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsZWFyKGV4cGVjdGVkU2l6ZTogbnVtYmVyID0gMTAyNCk6IHZvaWQge1xuICAgICAgICB0aGlzLnJlc2V0KGV4cGVjdGVkU2l6ZSk7XG4gICAgfVxuXG4gICAgZGVsZXRlKGtleTogSyk6IGJvb2xlYW4ge1xuICAgICAgICB0aHJvdyBcIlVuc3VwcG9ydGVkT3BlcmF0aW9uRXhjZXB0aW9uXCI7XG4gICAgfVxuXG4gICAgZm9yRWFjaChjYWxsYmFja2ZuOiAodmFsdWU6IFYsIGtleTogSywgbWFwOiBNYXA8SywgVj4pID0+IHZvaWQsIHRoaXNBcmc/OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgc3VwZXIuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnKTtcbiAgICB9XG5cbiAgICBnZXQoa2V5OiBLKTogViB8IHVuZGVmaW5lZCB7XG4gICAgICAgIGxldCBzdHJpbmdLZXk6IHN0cmluZztcbiAgICAgICAgaWYgKHR5cGVvZiBrZXkgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHN0cmluZ0tleSA9IEpTT04uc3RyaW5naWZ5KGtleSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHJpbmdLZXkgPSBrZXk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBoYXNoOiBudW1iZXIgPSBmbnYuZmFzdDFhMzIoc3RyaW5nS2V5KTtcbiAgICAgICAgLy8gQnVja2V0IGluIHdoaWNoIHRoaXMgdmFsdWUgc2hvdWxkIGJlIHN0b3JlZC5cbiAgICAgICAgY29uc3QgYnVja2V0ID0gKGhhc2ggJSB0aGlzLmJ1Y2tldHMpICogNDtcblxuICAgICAgICBjb25zdCBzdHJpbmdWYWwgPSB0aGlzLmZpbmRWYWx1ZShcbiAgICAgICAgICAgIHRoaXMuaW5kZXhWaWV3LmdldFVpbnQzMihidWNrZXQgKyBTaGFyZWFibGVNYXAuSU5ERVhfVEFCTEVfT0ZGU0VUKSxcbiAgICAgICAgICAgIHN0cmluZ0tleVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFRPRE8gZml4IGZvciBhbGwgdHlwZXMgaGVyZSFcbiAgICAgICAgcmV0dXJuIHN0cmluZ1ZhbCBhcyB1bmtub3duIGFzIFY7XG4gICAgfVxuXG4gICAgaGFzKGtleTogSyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoa2V5KSAhPT0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHNldChrZXk6IEssIHZhbHVlOiBWKTogdGhpcyB7XG4gICAgICAgIGxldCBzdHJpbmdLZXk6IHN0cmluZztcbiAgICAgICAgaWYgKHR5cGVvZiBrZXkgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHN0cmluZ0tleSA9IEpTT04uc3RyaW5naWZ5KGtleSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHJpbmdLZXkgPSBrZXk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBoYXNoOiBudW1iZXIgPSBmbnYuZmFzdDFhMzIoc3RyaW5nS2V5KTtcbiAgICAgICAgLy8gQnVja2V0IGluIHdoaWNoIHRoaXMgdmFsdWUgc2hvdWxkIGJlIHN0b3JlZC5cbiAgICAgICAgY29uc3QgYnVja2V0ID0gKGhhc2ggJSB0aGlzLmJ1Y2tldHMpICogNDtcblxuICAgICAgICBjb25zdCBuZXh0RnJlZSA9IHRoaXMuZnJlZVN0YXJ0O1xuXG4gICAgICAgIC8vIFBvaW50ZXIgdG8gbmV4dCBibG9jayBpcyBlbXB0eSBhdCB0aGlzIHBvaW50XG4gICAgICAgIHRoaXMuc3RvcmVEYXRhQmxvY2soc3RyaW5nS2V5LCB2YWx1ZSk7XG4gICAgICAgIC8vIEluY3JlYXNlIHNpemVcbiAgICAgICAgdGhpcy5pbmNyZWFzZVNpemUoKTtcblxuICAgICAgICBjb25zdCBidWNrZXRQb2ludGVyID0gdGhpcy5pbmRleFZpZXcuZ2V0VWludDMyKGJ1Y2tldCArIFNoYXJlYWJsZU1hcC5JTkRFWF9UQUJMRV9PRkZTRVQpO1xuICAgICAgICBpZiAoYnVja2V0UG9pbnRlciA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5pbmRleFZpZXcuc2V0VWludDMyKGJ1Y2tldCArIFNoYXJlYWJsZU1hcC5JTkRFWF9UQUJMRV9PRkZTRVQsIG5leHRGcmVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFVwZGF0ZSBsaW5rZWQgbGlzdCBwb2ludGVyc1xuICAgICAgICAgICAgdGhpcy51cGRhdGVMaW5rZWRQb2ludGVyKGJ1Y2tldFBvaW50ZXIsIG5leHRGcmVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldCBzaXplKCkge1xuICAgICAgICAvLyBTaXplIGlzIGJlaW5nIHN0b3JlZCBpbiB0aGUgZmlyc3QgNCBieXRlcyBvZiB0aGUgaW5kZXggdGFibGVcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5kZXhWaWV3LmdldFVpbnQzMigwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldCBidWNrZXRzKCkge1xuICAgICAgICAvLyBOdW1iZXIgb2YgYnVja2V0cyBpcyBzdG9yZWQgaW4gdGhlIHNlY29uZCBpbnRlZ2VyIG9mIHRoZSBpbmRleCB0YWJsZVxuICAgICAgICByZXR1cm4gdGhpcy5pbmRleFZpZXcuZ2V0VWludDMyKDQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IGZyZWVTdGFydCgpIHtcbiAgICAgICAgLy8gQXQgd2hhdCBwb3NpdGlvbiBpbiB0aGUgZGF0YSB0YWJsZSBkb2VzIHRoZSBmcmVlIHNwYWNlIHN0YXJ0P1xuICAgICAgICByZXR1cm4gdGhpcy5pbmRleFZpZXcuZ2V0VWludDMyKDgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0IGZyZWVTdGFydChwb3NpdGlvbikge1xuICAgICAgICB0aGlzLmluZGV4Vmlldy5zZXRVaW50MzIoOCwgcG9zaXRpb24pO1xuICAgIH1cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAqIEhlbHBlciBtZXRob2RzIHRoYXQgcmVhZCAvIHdyaXRlIGJpbmFyeSBkYXRhXG4gICAgICogdG8gdGhlIGFycmF5IGJ1ZmZlcnMuXG4gICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gICAgcHJpdmF0ZSBpbmNyZWFzZVNpemUoKSB7XG4gICAgICAgIHRoaXMuaW5kZXhWaWV3LnNldFVpbnQzMigwLCB0aGlzLnNpemUgKyAxKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0b3JlRGF0YUJsb2NrKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgICAgIGNvbnN0IG5leHRGcmVlID0gdGhpcy5mcmVlU3RhcnQ7XG5cbiAgICAgICAgY29uc3QgdGV4dEVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcblxuICAgICAgICAvLyBTdG9yZSBrZXkgaW4gZGF0YSBzdHJ1Y3R1cmVcbiAgICAgICAgY29uc3Qga2V5QXJyYXk6IFVpbnQ4QXJyYXkgPSBuZXcgVWludDhBcnJheSh0aGlzLmRhdGEsIG5leHRGcmVlICsgU2hhcmVhYmxlTWFwLkRBVEFfT0JKRUNUX09GRlNFVCk7XG4gICAgICAgIGxldCB3cml0ZVJlc3VsdCA9IHRleHRFbmNvZGVyLmVuY29kZUludG8oa2V5LCBrZXlBcnJheSk7XG4gICAgICAgIGNvbnN0IGtleUxlbmd0aCA9IHdyaXRlUmVzdWx0LndyaXR0ZW4gPyB3cml0ZVJlc3VsdC53cml0dGVuIDogMDtcblxuICAgICAgICBsZXQgc3RyaW5nVmFsOiBzdHJpbmc7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHN0cmluZ1ZhbCA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0cmluZ1ZhbCA9IHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdmFsdWVBcnJheTogVWludDhBcnJheSA9IG5ldyBVaW50OEFycmF5KFxuICAgICAgICAgICAgdGhpcy5kYXRhLFxuICAgICAgICAgICAgbmV4dEZyZWUgKyBTaGFyZWFibGVNYXAuREFUQV9PQkpFQ1RfT0ZGU0VUICsga2V5TGVuZ3RoXG4gICAgICAgICk7XG4gICAgICAgIHdyaXRlUmVzdWx0ID0gdGV4dEVuY29kZXIuZW5jb2RlSW50byhzdHJpbmdWYWwsIHZhbHVlQXJyYXkpO1xuICAgICAgICBjb25zdCB2YWx1ZUxlbmd0aCA9IHdyaXRlUmVzdWx0LndyaXR0ZW4gPyB3cml0ZVJlc3VsdC53cml0dGVuIDogMDtcblxuXG4gICAgICAgIC8vIFN0b3JlIGtleSBsZW5ndGhcbiAgICAgICAgdGhpcy5kYXRhVmlldy5zZXRVaW50MzIobmV4dEZyZWUgKyA0LCBrZXlMZW5ndGgpO1xuICAgICAgICAvLyBTdG9yZSB2YWx1ZSBsZW5ndGhcbiAgICAgICAgdGhpcy5kYXRhVmlldy5zZXRVaW50MzIobmV4dEZyZWUgKyA4LCB2YWx1ZUxlbmd0aCk7XG5cbiAgICAgICAgdGhpcy5mcmVlU3RhcnQgPSBuZXh0RnJlZSArIFNoYXJlYWJsZU1hcC5EQVRBX09CSkVDVF9PRkZTRVQgKyBrZXlMZW5ndGggKyB2YWx1ZUxlbmd0aDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZUxpbmtlZFBvaW50ZXIoc3RhcnRQb3M6IG51bWJlciwgbmV4dEJsb2NrOiBudW1iZXIpIHtcbiAgICAgICAgd2hpbGUgKHRoaXMuZGF0YVZpZXcuZ2V0VWludDMyKHN0YXJ0UG9zKSAhPT0gMCkge1xuICAgICAgICAgICAgc3RhcnRQb3MgPSB0aGlzLmRhdGFWaWV3LmdldFVpbnQzMihzdGFydFBvcyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kYXRhVmlldy5zZXRVaW50MzIoc3RhcnRQb3MsIG5leHRCbG9jayk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kVmFsdWUoc3RhcnRQb3M6IG51bWJlciwga2V5OiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgICAgICB3aGlsZSAoc3RhcnRQb3MgIT09IDApIHtcbiAgICAgICAgICAgIGNvbnN0IHJlYWRLZXkgPSB0aGlzLnJlYWRLZXlGcm9tRGF0YU9iamVjdChzdGFydFBvcyk7XG4gICAgICAgICAgICBpZiAocmVhZEtleSA9PT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVhZFZhbHVlRnJvbURhdGFPYmplY3Qoc3RhcnRQb3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdGFydFBvcyA9IHRoaXMuZGF0YVZpZXcuZ2V0VWludDMyKHN0YXJ0UG9zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVhZEtleUZyb21EYXRhT2JqZWN0KHN0YXJ0UG9zOiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBrZXlMZW5ndGggPSB0aGlzLmRhdGFWaWV3LmdldFVpbnQzMihzdGFydFBvcyArIDQpO1xuXG4gICAgICAgIGNvbnN0IHRleHREZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCk7XG5cbiAgICAgICAgY29uc3Qga2V5QXJyYXk6IFVpbnQ4QXJyYXkgPSBuZXcgVWludDhBcnJheShcbiAgICAgICAgICAgIHRoaXMuZGF0YSxcbiAgICAgICAgICAgIHN0YXJ0UG9zICsgU2hhcmVhYmxlTWFwLkRBVEFfT0JKRUNUX09GRlNFVCxcbiAgICAgICAgICAgIGtleUxlbmd0aFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gdGV4dERlY29kZXIuZGVjb2RlKGtleUFycmF5KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlYWRWYWx1ZUZyb21EYXRhT2JqZWN0KHN0YXJ0UG9zOiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBrZXlMZW5ndGggPSB0aGlzLmRhdGFWaWV3LmdldFVpbnQzMihzdGFydFBvcyArIDQpO1xuICAgICAgICBjb25zdCB2YWx1ZUxlbmd0aCA9IHRoaXMuZGF0YVZpZXcuZ2V0VWludDMyKHN0YXJ0UG9zICsgOCk7XG5cbiAgICAgICAgY29uc3QgdGV4dERlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICAgICAgY29uc3QgdmFsdWVBcnJheTogVWludDhBcnJheSA9IG5ldyBVaW50OEFycmF5KFxuICAgICAgICAgICAgdGhpcy5kYXRhLFxuICAgICAgICAgICAgc3RhcnRQb3MgKyBTaGFyZWFibGVNYXAuREFUQV9PQkpFQ1RfT0ZGU0VUICsga2V5TGVuZ3RoLFxuICAgICAgICAgICAgdmFsdWVMZW5ndGhcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHRleHREZWNvZGVyLmRlY29kZSh2YWx1ZUFycmF5KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2V0KGV4cGVjdGVkU2l6ZTogbnVtYmVyKSB7XG4gICAgICAgIC8vIEZpcnN0IDQgYnl0ZXMgYXJlIHVzZWQgdG8gc3RvcmUgdGhlIGFtb3VudCBvZiBpdGVtcyBpbiB0aGUgbWFwLiBTZWNvbmQgNCBieXRlcyBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IGJ1Y2tldHNcbiAgICAgICAgLy8gYXJlIGN1cnJlbnRseSBiZWluZyB1c2VkLiBUaGlyZCBzZXQgb2YgNCBieXRlcyBpcyB1c2VkIHRvIHRyYWNrIHdoZXJlIHRoZSBmcmVlIHNwYWNlIGluIHRoZSBkYXRhIHRhYmxlXG4gICAgICAgIC8vIHN0YXJ0cy4gUmVzdCBvZiB0aGUgaW5kZXggbWFwcyBidWNrZXRzIG9udG8gdGhlaXIgc3RhcnRpbmcgcG9zaXRpb24gaW4gdGhlIGRhdGEgYXJyYXkuXG4gICAgICAgIGNvbnN0IGJ1Y2tldHMgPSBNYXRoLmNlaWwoZXhwZWN0ZWRTaXplIC8gU2hhcmVhYmxlTWFwLkxPQURfRkFDVE9SKVxuICAgICAgICBjb25zdCBpbmRleFNpemUgPSAzICogNCArIGJ1Y2tldHMgKiBTaGFyZWFibGVNYXAuSU5UX1NJWkU7XG4gICAgICAgIHRoaXMuaW5kZXggPSBuZXcgU2hhcmVkQXJyYXlCdWZmZXIoaW5kZXhTaXplKTtcbiAgICAgICAgdGhpcy5pbmRleFZpZXcgPSBuZXcgRGF0YVZpZXcodGhpcy5pbmRleCwgMCwgaW5kZXhTaXplKTtcblxuICAgICAgICAvLyBTZXQgYnVja2V0c1xuICAgICAgICB0aGlzLmluZGV4Vmlldy5zZXRVaW50MzIoNCwgYnVja2V0cyk7XG4gICAgICAgIC8vIEZyZWUgc3BhY2Ugc3RhcnRzIGZyb20gcG9zaXRpb24gMSBpbiB0aGUgZGF0YSBhcnJheSAoaW5zdGVhZCBvZiAwLCB3aGljaCB3ZSB1c2UgdG8gaW5kaWNhdGUgdGhlIGVuZCkuXG4gICAgICAgIHRoaXMuaW5kZXhWaWV3LnNldFVpbnQzMig4LCA0KTtcblxuICAgICAgICAvLyBSZXNlcnZlIDI1NiBieXRlcyBwZXIgdmFsdWUgKHNpbmNlIHN0cmluZ3MgYXJlIGdvaW5nIHRvIGJlIHN0b3JlZCBpbiB0aGlzIG1hcCkuXG4gICAgICAgIHRoaXMuZGF0YSA9IG5ldyBTaGFyZWRBcnJheUJ1ZmZlcigyNTYgKiBleHBlY3RlZFNpemUpO1xuICAgICAgICB0aGlzLmRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KHRoaXMuZGF0YSwgMCwgMjU2ICogZXhwZWN0ZWRTaXplKTtcbiAgICB9XG59XG4iXX0=