"use strict"

const R = require("ramda")
const SteamUser = require("steam-user")
const inquirer = require("inquirer")

const manageDB = require("./database")

const database = manageDB.read()

const promptGames = {
  type: "checkbox",
  name: "games",
  message: "Select the games to boost:",
  choices: [
    { value: 233860, name: 'Kenshi', checked: true },
    { value: 22320, name: 'The Elder Scrolls III: Morrowind', checked: true },
    { value: 335670, name: 'LISA', checked: true },
    { value: 427520, name: 'Factorio', checked: true },
    { value: 22330, name: 'The Elder Scrolls IV: Oblivion', checked: true },
    { value: 38410, name: 'Fallout 2', checked: true },
    { value: 38400, name: 'Fallout', checked: true },
    { value: 108600, name: 'Project Zomboid', checked: true },
    { value: 7670, name: 'BioShock', checked: true },
    { value: 8850, name: 'BioShock 2', checked: true },
    { value: 48700, name: 'Mount & Blade: Warband', checked: true },
    { value: 3920, name: "Sid Meier's Pirates!", checked: true },
    { value: 243120, name: 'Betrayer', checked: true },
    { value: 219150, name: 'Hotline Miami', checked: true },
    { value: 274170, name: 'Hotline Miami 2: Wrong Number', checked: true },
    { value: 4500, name: 'S.T.A.L.K.E.R.: Shadow of Chernobyl', checked: true },
    { value: 20510, name: 'S.T.A.L.K.E.R.: Clear Sky', checked: true },
    { value: 41700, name: 'S.T.A.L.K.E.R.: Call of Pripyat', checked: true },
    { value: 20900, name: 'The Witcher', checked: true },
    { value: 15100, name: "Assassin's Creed", checked: true },
    { value: 33230, name: "Assassin's Creed II", checked: true }
  ]
}

inquirer
  .prompt([
    { name: "username", message: "Username:" },
    { name: "password", message: "Password:", type: "password" },
    promptGames
  ])
  .then(({ username, password, games }) => {
    let index = R.findIndex(R.propEq("name", username), database)

    if (index === -1) {
      database.push({
        name: username,
        password,
        games
      })
    }

    const client = new SteamUser()
    client.setOption("promptSteamGuardCode", false)
    client.setOption("dataDirectory", 'session')
    client.logOn({
      accountName: username,
      password
    })

    client.on("steamGuard", (domain, callback) => {
      if (domain) return inquirer
        .prompt([{ name: "code", message: `Steam guard code (${domain}):` }])
        .then(({ code }) => callback(code))
    })

    client.on("sentry", sentry => {
      database[index].sentry = sentry.toString("base64")
      return manageDB.write(database)
    })

    client.on("error", err => {
      console.log(`Error: ${err}`)
      return process.exit(1)
    })

    manageDB.write(database)
    return process.exit(0)
  })
