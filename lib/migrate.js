"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _appRootPath = require("app-root-path");

var _appRootPath2 = _interopRequireDefault(_appRootPath);

var _database = require("./database");

var manageDB = _interopRequireWildcard(_database);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var moveFileToConfigFolder = function moveFileToConfigFolder(filename) {
  var path = _appRootPath2.default.resolve(filename);
  var pathDest = _appRootPath2.default.resolve("config/" + filename);
  if (_fsExtra2.default.pathExistsSync(path)) {
    _fsExtra2.default.moveSync(path, pathDest, { overwrite: true });
    return console.log("[+] Moved '" + filename + "' to config folder!");
  }
};

var convertOldDatabaseFormat = function convertOldDatabaseFormat() {
  var path = _appRootPath2.default.resolve("config/database.json");
  if (!_fsExtra2.default.pathExistsSync(path)) return manageDB.write([]);

  var database = manageDB.read();
  if (!_lodash2.default.isPlainObject(database)) return;

  manageDB.write(database, "config/database.json.bak");
  database = _lodash2.default.map(database, function (data, name) {
    data.name = name;
    return data;
  });
  manageDB.write(database);
  return console.log("[+] Converted database to new format! The old one has been backuped as database.json.bak");
};

exports.default = function () {
  ["database.json", "telebot.json"].forEach(moveFileToConfigFolder);
  return convertOldDatabaseFormat();
};