_               = require 'lodash'
SteamUser       = require 'steam-user'
SteamTotp       = require 'steam-totp'
inquirer        = require 'inquirer'
jsonfile        = require 'jsonfile'
jsonfile.spaces = 2

try
  database = jsonfile.readFileSync 'database.json'
catch e
  database = {}
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
      inquirer.prompt [name: 'secret', message: 'Two-factor shared secret:']
      .then ({secret}) -> callback SteamTotp.generateAuthCode secret

  client.on 'sentry', (sentry) ->
    database[username].sentry = sentry.toString('base64')
    jsonfile.writeFileSync 'database.json', database

  client.on 'loggedOn', (details) ->
    database[username] = password: password, games: [10, 730]
    database[username].secret = secret if secret
    inquirer.prompt promptGames
    .then ({games}) ->
      database[username].games = games
      jsonfile.writeFileSync 'database.json', database
      process.exit 0

  client.on 'error', (err) ->
    console.log "Error: #{err}"
    process.exit 1
