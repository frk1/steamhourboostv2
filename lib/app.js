"use strict"

const SteamAccount = require("./steamaccount")

const manageDB = require("./database")

const database = manageDB.read()

database.map(credentials => {
  const { name, password, games } = credentials

  const account = new SteamAccount(name, password, null, null, games, 0)
  console.log("[=] Start boosting")
  account
    .login()
    .then(() => account.boost())
    .finally(() => account.logoff())
})
