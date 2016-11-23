SteamUser = require 'steam-user'
SteamTotp = require 'steam-totp'
inquirer  = require 'inquirer'
jsonfile  = require 'jsonfile'
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
  {value: 730, name: 'CS:GO', checked: true}
	{value: 10, name: 'CS 1.6', checked: true}
	{value: 359550, name: 'R6S', checked: true}
	{value: 252490, name: 'RUST', checked: true}
	{value: 252950, name: 'ROCKETLEAGUE', checked: true}
	{value: 242760, name: 'FOREST', checked: true}
	{value: 346110, name: 'ARK: Survival Evolved', checked: true}
	{value: 444090, name: 'Paladins', checked: true}
	{value: 282660, name: 'EAC', checked: true}
	{value: 381210, name: 'Dead BY Daylight', checked: true}
	{value: 433850, name: 'H1Z1', checked: true}
	{value: 218620, name: 'PayDay2', checked: true}
	{value: 307780, name: 'MK:X', checked: true}
	{value: 570, name: 'DOTA2'}
  ]

inquirer.prompt [
  {name: 'username', message: 'Username:'}
  {name: 'password', message: 'Password:', type: 'password'}
]
.then ({username, password}) ->
  database[username] = {}
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
      .then ({secret}) ->
        SteamTotp.generateAuthCode secret, (err, code) ->
          database[username].secret = secret
          callback code

  client.on 'sentry', (sentry) ->
    database[username].sentry = sentry.toString('base64')
    jsonfile.writeFileSync 'database.json', database

  client.on 'loggedOn', (details) ->
    database[username].password = password
    inquirer.prompt promptGames
    .then ({games}) ->
      database[username].games = games
      jsonfile.writeFileSync 'database.json', database
      process.exit 0

  client.on 'error', (err) ->
    console.log "Error: #{err}"
    process.exit 1
