"use strict";

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _migrate = require("./migrate");

var _migrate2 = _interopRequireDefault(_migrate);

var _steamaccount = require("./steamaccount");

var _steamaccount2 = _interopRequireDefault(_steamaccount);

var _database = require("./database");

var manageDB = _interopRequireWildcard(_database);

var _telebot = require("./telebot");

var _telebot2 = _interopRequireDefault(_telebot);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _migrate2.default)();
var database = manageDB.read();

(0, _telebot2.default)();

if (database.length === 0) {
  console.error("[!] No accounts have been added! Please run 'npm run user' to add accounts!");
  process.exit(0);
}

var pad = 24 + _lodash2.default.maxBy(_ramda2.default.pluck("name", database), "length").length;
var accounts = _lodash2.default.compact(database.map(function (_ref) {
  var name = _ref.name,
      password = _ref.password,
      sentry = _ref.sentry,
      secret = _ref.secret,
      _ref$games = _ref.games,
      games = _ref$games === undefined ? [] : _ref$games;

  if (games.length > 0) return new _steamaccount2.default(name, password, sentry, secret, games, pad);

  return null;
}));

var restartBoost = function restartBoost() {
  console.log("[=] Restart boosting");
  return _bluebird2.default.map(accounts, _lodash2.default.method("restartGames")).delay(1800000).finally(restartBoost);
};

console.log("[=] Start boosting");
_bluebird2.default.map(accounts, _lodash2.default.method("boost")).delay(1800000).then(restartBoost);