"use strict"

const _ = require("lodash")
const SteamUser = require("steam-user")
const Promise = require("bluebird")
const moment = require("moment")
const EventEmitter = require("events")
const inquirer = require("inquirer")
const fs = require('fs-extra')

module.exports = class SteamAccount extends EventEmitter {
  constructor(name, password, sentry, secret, games, indent = 0) {
    super()
    this.name = name
    this.password = password
    this.sentry = sentry
    this.secret = secret
    this.games = games
    this.indent = indent
    const options = {
      promptSteamGuardCode: false,
      dataDirectory: 'session'
    }
    let loginKey = fs.readFileSync(`session/loginKey-${this.name}`, { encoding: 'utf8', flag: 'a+' })
    this.loginKey = loginKey ? loginKey : null
    this.client = new SteamUser(null, options)
    if (this.sentry) this.client.setSentry(Buffer.from(this.sentry, "base64"))

    this.client.on("error", err => this.emit("clientError", err))
    this.client.on("steamGuard", (_, callback) => {
      return inquirer
        .prompt([{ name: "code", message: `Guard code for ${this.name}:` }])
        .then(({ code }) => callback(code))
    })
    this.client.on("loginKey", key => fs.writeFileSync(`session/loginKey-${this.name}`, key))
  }

  logheader() {
    return _.padEnd(
      `[${moment().format("YYYY-MM-DD HH:mm:ss")} - ${this.name}]`,
      this.indent
    )
  }

  error(err) {
    return this.emit("customError", err)
  }

  login() {
    if (this.client.loggedOn) return Promise.resolve()

    return new Promise((resolve, reject) => {
      this.once("clientError", reject)
      this.once("clientSteamGuard", () => reject("Steam guard requested!"))
      this.client.once("loggedOn", resolve)

      if (this.loginKey === null)
        return this.client.logOn({
          accountName: this.name,
          password: this.password,
          twoFactorCode: this.code,
          rememberPassword: true
        })
      else
        return this.client.logOn({
          rememberPassword: true,
          accountName: this.name,
          loginKey: this.loginKey,
        })
    })
      .timeout(30000)
      .catch(Promise.TimeoutError, () => Promise.reject("Timed out at login"))
      .finally(() => {
        this.removeAllListeners("clientError")
        this.removeAllListeners("clientSteamGuard")
        return this.client.removeAllListeners("loggedOn")
      })
  }

  logoff() {
    return this.client.logOff()
  }

  boost() {
    const doJob = () => {
      this.client.setPersona(SteamUser.EPersonaState.Offline)
      this.client.gamesPlayed(this.games !== null ? this.games : [10, 730])
    }

    const doLog = () =>
      console.log(`${this.logheader()} Still boosting`)

    return new Promise((resolve, reject) => {
      console.log(`${this.logheader()} Boosting games!`)
      doJob()

      const loggerInterval = setInterval(doLog, 1800000)

      const loggedOnListener = this.client.on('loggedOn', doJob)
      this.client.once("error", e => {
        this.client.gamesPlayed([])
        clearInterval(loggerInterval)
        this.client.removeListener('loggedOn', loggedOnListener)
        reject(e)
      })
    })
  }
}
