"use strict"

const R = require("ramda")
const SteamUser = require("steam-user")
const SteamTotp = require("steam-totp")
const inquirer = require("inquirer")

const migrate = require("./migrate")
const manageDB = require("./database")

migrate()
const database = manageDB.read()

const promptGames = {
  type: "checkbox",
  name: "games",
  message: "Select the games to boost:",
  choices: [
    { value: 10, name: "CS 1.6", checked: true },
    { value: 730, name: "CS:GO", checked: true },
    { value: 570, name: "DOTA2" }
  ]
}

inquirer
  .prompt([
    { name: "username", message: "Username:" },
    { name: "password", message: "Password:", type: "password" }
  ])
  .then(({ username, password }) => {
    let index = R.findIndex(R.propEq("name", username), database)
    if (index === -1) {
      database.push({
        name: username,
        password
      })
      index = R.findIndex(R.propEq("name", username), database)
    }

    const client = new SteamUser()
    client.setOption("promptSteamGuardCode", false)
    client.setOption("dataDirectory", null)
    client.logOn({
      accountName: username,
      password
    })

    client.on("steamGuard", (domain, callback) => {
      if (domain) return inquirer
          .prompt([{ name: "code", message: `Steam guard code (${domain}):` }])
          .then(({ code }) => callback(code))

      return inquirer
        .prompt([
          {
            name: "secret",
            message: "Two-factor shared secret:",
            type: "password"
          }
        ])
        .then(({ secret }) =>
          SteamTotp.generateAuthCode(secret, (err, code) => {
            database[index].secret = secret
            return callback(code)
          })
        )
    })

    client.on("sentry", sentry => {
      database[index].sentry = sentry.toString("base64")
      return manageDB.write(database)
    })

    client.on("loggedOn", () => {
      database[index].password = password
      return inquirer
      .prompt([
        { 
          name: "customtitle",
          message: "Type in your custom gametitle (leave empty to use default titles):" 
        },
          promptGames
        ])
        .then(({ customtitle, games }) => {
          if(customtitle) {
            database[index].customtitle = customtitle
          }
          database[index].games = games
          manageDB.write(database)
          return process.exit(0)
      })
    })

    return client.on("error", err => {
      console.log(`Error: ${err}`)
      return process.exit(1)
    })
  })
