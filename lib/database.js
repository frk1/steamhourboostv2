"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.write = exports.read = undefined;

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _appRootPath = require("app-root-path");

var _appRootPath2 = _interopRequireDefault(_appRootPath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var write = function write(obj) {
  var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "config/database.json";
  return _fsExtra2.default.writeJsonSync(_appRootPath2.default.resolve(path), obj, { spaces: 2, EOL: "\n" });
};

var read = function read() {
  var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "config/database.json";
  return _fsExtra2.default.readJsonSync(_appRootPath2.default.resolve(path));
};

exports.read = read;
exports.write = write;