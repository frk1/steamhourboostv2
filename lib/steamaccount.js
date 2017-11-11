"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _steamUser = require("steam-user");

var _steamUser2 = _interopRequireDefault(_steamUser);

var _steamTotp = require("steam-totp");

var _steamTotp2 = _interopRequireDefault(_steamTotp);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _events = require("events");

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SteamAccount = function (_EventEmitter) {
  _inherits(SteamAccount, _EventEmitter);

  function SteamAccount(name, password, sentry, secret, games) {
    var indent = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

    _classCallCheck(this, SteamAccount);

    var _this = _possibleConstructorReturn(this, (SteamAccount.__proto__ || Object.getPrototypeOf(SteamAccount)).call(this));

    _this.name = name;
    _this.password = password;
    _this.sentry = sentry;
    _this.secret = secret;
    _this.games = games;
    _this.indent = indent;
    var options = {
      promptSteamGuardCode: false,
      dataDirectory: null
    };
    _this.client = new _steamUser2.default(null, options);
    if (_this.sentry) _this.client.setSentry(Buffer.from(_this.sentry, "base64"));

    _this.client.on("error", function (err) {
      return _this.emit("clientError", err);
    });
    _this.client.on("steamGuard", function () {
      return _this.emit("clientSteamGuard");
    });
    _this.client.once("steamGuard", function () {
      return _this.steamGuardRequested = true;
    });
    return _this;
  }

  _createClass(SteamAccount, [{
    key: "logheader",
    value: function logheader() {
      return _lodash2.default.padEnd("[" + (0, _moment2.default)().format("YYYY-MM-DD HH:mm:ss") + " - " + this.name + "]", this.indent);
    }
  }, {
    key: "error",
    value: function error(err) {
      return this.emit("customError", err);
    }
  }, {
    key: "login",
    value: function login() {
      var _this2 = this;

      if (this.client.client.loggedOn) return _bluebird2.default.resolve();
      if (this.steamGuardRequested && !this.secret) return _bluebird2.default.reject("Steam guard requested!");

      return new _bluebird2.default(function (resolve, reject) {
        _this2.once("clientError", reject);
        _this2.once("clientSteamGuard", function () {
          return reject("Steam guard requested!");
        });
        _this2.client.once("loggedOn", resolve);
        if (_this2.secret) return _steamTotp2.default.getAuthCode(_this2.secret, function (err, code) {
          return _this2.client.logOn({
            accountName: _this2.name,
            password: _this2.password,
            twoFactorCode: code
          });
        });

        return _this2.client.logOn({
          accountName: _this2.name,
          password: _this2.password
        });
      }).timeout(10000).catch(_bluebird2.default.TimeoutError, function () {
        return _bluebird2.default.reject("Timed out at login");
      }).finally(function () {
        _this2.removeAllListeners("clientError");
        _this2.removeAllListeners("clientSteamGuard");
        return _this2.client.removeAllListeners("loggedOn");
      });
    }
  }, {
    key: "logoff",
    value: function logoff() {
      if (!this.client.client.loggedOn) return;
      this.client.gamesPlayed([]);
      return this.client.logOff();
    }
  }, {
    key: "boost",
    value: function boost() {
      var _this3 = this;

      return this.login().then(function () {
        _this3.client.setPersona(_steamUser2.default.EPersonaState.Offline);
        _this3.client.gamesPlayed(_this3.games !== null ? _this3.games : [10, 730]);
        return console.log(_this3.logheader() + " Starting to boost games!");
      }).catch(function (err) {
        return console.error(_this3.logheader() + " " + err);
      });
    }
  }, {
    key: "restartGames",
    value: function restartGames() {
      this.client.gamesPlayed([]);
      return _bluebird2.default.delay("5000").then(this.boost);
    }
  }]);

  return SteamAccount;
}(_events2.default);

exports.default = SteamAccount;