"use strict"

const _ = require("lodash")
const R = require("ramda")
const Promise = require("bluebird")

const SteamAccount = require("./steamaccount")
const migrate = require("./migrate")
const manageDB = require("./database")

migrate()
const database = manageDB.read()

const telebot = require("./telebot")
telebot()

if (database.length === 0) {
  console.error(
    "[!] No accounts have been added! Please run 'npm run user' to add accounts!"
  )
  process.exit(0)
}

const pad = 24 + _.maxBy(R.pluck("name", database), "length").length
const accounts = database
  .map(({ name, password, sentry, secret, games = [] }) => {
    if (games.length > 0) return new SteamAccount(name, password, sentry, secret, games, pad)
    return null
  })
  .filter(val => val !== null)

const restartBoost = () => {
  console.log("[=] Restart boosting")
  return Promise.map(accounts, _.method("restartGames"))
    .delay(1800000)
    .finally(restartBoost)
}

console.log("[=] Start boosting")
Promise.map(accounts, _.method("boost"))
  .delay(1800000)
  .then(restartBoost)
