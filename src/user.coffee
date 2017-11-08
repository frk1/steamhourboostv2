_             = require 'lodash'
R             = require 'ramda'
SteamUser     = require 'steam-user'
SteamTotp     = require 'steam-totp'
inquirer      = require 'inquirer'
global.reqlib = require('app-root-path').require

manageDB = reqlib 'src/database'
database = manageDB.read()

secret = null

promptGames =
  type: 'checkbox'
  name: 'games'
  message: 'Select the games to boost:'
  choices: [
    {value: 10, name: 'CS 1.6', checked: true}
    {value: 730, name: 'CS:GO', checked: true}
    {value: 570, name: 'DOTA2'}
  ]

inquirer.prompt [
  {name: 'username', message: 'Username:'}
  {name: 'password', message: 'Password:', type: 'password'}
]
.then ({username, password}) ->
  index = R.findIndex R.propEq('name', username), database
  if index is -1
    database.push
      name: username
      password: password
    index = R.findIndex R.propEq('name', username), database

  client = new SteamUser
  client.setOption 'promptSteamGuardCode', false
  client.setOption 'dataDirectory', null
  client.logOn
    accountName: username,
    password: password,

  client.on 'steamGuard', (domain, callback) ->
    if domain
      inquirer.prompt [name: 'code', message: "Steam guard code (#{domain}):"]
      .then ({code}) -> callback code
    else
      inquirer.prompt [name: 'secret', message: 'Two-factor shared secret:', type: 'password']
      .then ({secret}) ->
        SteamTotp.generateAuthCode secret, (err, code) ->
          database[index].secret = secret
          callback code

  client.on 'sentry', (sentry) ->
    database[index].sentry = sentry.toString('base64')
    manageDB.write database

  client.on 'loggedOn', (details) ->
    database[index].password = password
    inquirer.prompt promptGames
    .then ({games}) ->
      database[index].games = games
      manageDB.write database
      process.exit 0

  client.on 'error', (err) ->
    console.log "Error: #{err}"
    process.exit 1
