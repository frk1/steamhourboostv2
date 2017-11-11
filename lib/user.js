"use strict";

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _steamUser = require("steam-user");

var _steamUser2 = _interopRequireDefault(_steamUser);

var _steamTotp = require("steam-totp");

var _steamTotp2 = _interopRequireDefault(_steamTotp);

var _inquirer = require("inquirer");

var _inquirer2 = _interopRequireDefault(_inquirer);

var _migrate = require("./migrate");

var _migrate2 = _interopRequireDefault(_migrate);

var _database = require("./database");

var manageDB = _interopRequireWildcard(_database);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _migrate2.default)();
var database = manageDB.read();

var promptGames = {
  type: "checkbox",
  name: "games",
  message: "Select the games to boost:",
  choices: [{ value: 10, name: "CS 1.6", checked: true }, { value: 730, name: "CS:GO", checked: true }, { value: 570, name: "DOTA2" }]
};

_inquirer2.default.prompt([{ name: "username", message: "Username:" }, { name: "password", message: "Password:", type: "password" }]).then(function (_ref) {
  var username = _ref.username,
      password = _ref.password;

  var index = _ramda2.default.findIndex(_ramda2.default.propEq("name", username), database);
  if (index === -1) {
    database.push({
      name: username,
      password: password
    });
    index = _ramda2.default.findIndex(_ramda2.default.propEq("name", username), database);
  }

  var client = new _steamUser2.default();
  client.setOption("promptSteamGuardCode", false);
  client.setOption("dataDirectory", null);
  client.logOn({
    accountName: username,
    password: password
  });

  client.on("steamGuard", function (domain, callback) {
    if (domain) return _inquirer2.default.prompt([{ name: "code", message: "Steam guard code (" + domain + "):" }]).then(function (_ref2) {
      var code = _ref2.code;
      return callback(code);
    });

    return _inquirer2.default.prompt([{
      name: "secret",
      message: "Two-factor shared secret:",
      type: "password"
    }]).then(function (_ref3) {
      var secret = _ref3.secret;
      return _steamTotp2.default.generateAuthCode(secret, function (err, code) {
        database[index].secret = secret;
        return callback(code);
      });
    });
  });

  client.on("sentry", function (sentry) {
    database[index].sentry = sentry.toString("base64");
    return manageDB.write(database);
  });

  client.on("loggedOn", function () {
    database[index].password = password;
    return _inquirer2.default.prompt(promptGames).then(function (_ref4) {
      var games = _ref4.games;

      database[index].games = games;
      manageDB.write(database);
      return process.exit(0);
    });
  });

  return client.on("error", function (err) {
    console.log("Error: " + err);
    return process.exit(1);
  });
});