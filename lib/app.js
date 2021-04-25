"use strict"

const SteamAccount = require("./steamaccount")

const account = new SteamAccount(process.env.STEAM_LOGIN, process.env.STEAM_PASS, null, null, [233860, 22320, 335670, 427520, 22330, 38410, 38400], 0)
console.log("[=] Start boosting")
account
  .login()  
  .then(() => account.boost())
  .finally(() => account.logoff())
