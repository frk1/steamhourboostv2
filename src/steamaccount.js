import _ from "lodash"
import SteamUser from "steam-user"
import SteamTotp from "steam-totp"
import Promise from "bluebird"
import moment from "moment"
import EventEmitter from "events"

export default class SteamAccount extends EventEmitter {
  constructor(name, password, sentry, secret, games, indent = 0) {
    super()
    this.logheader = this.logheader.bind(this)
    this.error = this.error.bind(this)
    this.login = this.login.bind(this)
    this.logoff = this.logoff.bind(this)
    this.boost = this.boost.bind(this)
    this.restartGames = this.restartGames.bind(this)
    this.name = name
    this.password = password
    this.sentry = sentry
    this.secret = secret
    this.games = games
    this.indent = indent
    const options = {
      promptSteamGuardCode: false,
      dataDirectory: null
    }
    this.client = new SteamUser(null, options)
    if (this.sentry) this.client.setSentry(Buffer.from(this.sentry, "base64"))

    this.client.on("error", err => this.emit("clientError", err))
    this.client.on("steamGuard", () => this.emit("clientSteamGuard"))
    this.client.once("steamGuard", () => (this.steamGuardRequested = true))
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
    if (this.client.client.loggedOn) return Promise.resolve()

    if (this.steamGuardRequested && !this.secret) return Promise.reject("Steam guard requested!")

    return new Promise((resolve, reject) => {
      this.once("clientError", reject)
      this.once("clientSteamGuard", () => reject("Steam guard requested!"))
      this.client.once("loggedOn", resolve)
      if (this.secret) return SteamTotp.getAuthCode(this.secret, (err, code) => {
          return this.client.logOn({
            accountName: this.name,
            password: this.password,
            twoFactorCode: code
          })
        })

      return this.client.logOn({
        accountName: this.name,
        password: this.password
      })
    })
      .timeout(10000)
      .catch(Promise.TimeoutError, () => Promise.reject("Timed out at login"))
      .finally(() => {
        this.removeAllListeners("clientError")
        this.removeAllListeners("clientSteamGuard")
        return this.client.removeAllListeners("loggedOn")
      })
  }

  logoff() {
    if (!this.client.client.loggedOn) return

    this.client.gamesPlayed([])
    return this.client.logOff()
  }

  boost() {
    return this.login()
      .then(() => {
        this.client.setPersona(SteamUser.EPersonaState.Offline)
        this.client.gamesPlayed(this.games !== null ? this.games : [10, 730])
        return console.log(`${this.logheader()} Starting to boost games!`)
      })
      .catch(err => console.error(`${this.logheader()} ${err}`))
  }

  restartGames() {
    this.client.gamesPlayed([])
    return Promise.delay("5000").then(this.boost)
  }
}
