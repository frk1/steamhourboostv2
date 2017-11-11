"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _fuse = require("fuse.js");

var _fuse2 = _interopRequireDefault(_fuse);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _telegraf = require("telegraf");

var _telegraf2 = _interopRequireDefault(_telegraf);

var _database = require("./database");

var manageDB = _interopRequireWildcard(_database);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var database = manageDB.read();

var totp = _bluebird2.default.promisify(require("steam-totp").getAuthCode);

var token = void 0,
    admin_id = void 0;

try {
  var _manageDB$read = manageDB.read("config/telebot.json");

  token = _manageDB$read.token;
  admin_id = _manageDB$read.admin_id;
} catch (e) {
  token = "";
  admin_id = 0;
  manageDB.write({ token: token, admin_id: admin_id }, "config/telebot.json");
}

var validate_admin = function validate_admin(ctx, next) {
  if (ctx.from.id === admin_id) return next();

  console.error("[#] [" + (0, _moment2.default)().format() + "] " + ctx.from.id + " tried to request!");
  return ctx.replyWithMarkdown("You *do not* have the permission to use this bot!\n\nYour telegram id is: `" + ctx.from.id + "`");
};

var bot = new _telegraf2.default(token);
bot.use(validate_admin);
bot.command("cancel", function (ctx) {
  return ctx.scene.leave();
});

var fuzzy = function fuzzy() {
  var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

  if (database.length === 0) return [];
  if (query.length === 0) return _ramda2.default.pluck("name", database);

  var fuse = new _fuse2.default(database, {
    id: "name",
    keys: ["name"],
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 0
  });
  return fuse.search(query);
};

bot.command("list", function (ctx) {
  var query = ctx.message.text.length < 6 ? "" : ctx.message.text.substr(6);
  var fmt = "The following accounts are available:\n";
  fuzzy(query).map(function (a) {
    return fmt += "`- " + a + "`\n";
  });
  return ctx.replyWithMarkdown(fmt);
});

bot.hears(/(.*)/, function (ctx) {
  var _Array$from = Array.from(fuzzy(ctx.message.text)),
      _Array$from2 = _slicedToArray(_Array$from, 1),
      name = _Array$from2[0];

  if (name) {
    var acc = _ramda2.default.find(_ramda2.default.propEq("name", name), database);
    return totp(acc.secret).then(function (code) {
      return ctx.replyWithMarkdown("Selected account *" + acc.name + "*.\n\n2FA-Code: `" + code + "`");
    }).catch(function (err) {
      return ctx.replyWithMarkdown("Selected account *" + acc.name + "*.\n\nError: `" + err + "`");
    });
  }
  return ctx.replyWithMarkdown("Could not find a matching account!\n\nTry */list* to get a list of available accounts!");
});

var start = function start() {
  if (token === "") return console.log("[!] If you want to use the telegram bot please set a valid token in telebot.json!");

  console.log("[=] Start Telegram bot");
  return bot.startPolling();
};

exports.default = start;