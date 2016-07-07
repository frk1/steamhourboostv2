_               = require 'lodash'
SteamUser       = require 'steam-user'
SteamTotp       = require 'steam-totp'
readLineSync    = require 'readline-sync'
jsonfile        = require 'jsonfile'
jsonfile.spaces = 2

username = readLineSync.question "Username: "
password = readLineSync.question "Password: ", hideEchoBack: true
secret = null

try
  database = jsonfile.readFileSync 'database.json'
catch e
  database = {}

client = new SteamUser
client.setOption 'promptSteamGuardCode', false
client.setOption 'dataDirectory', null
client.logOn
  accountName: username,
  password: password,

client.on 'steamGuard', (domain, callback) ->
  if domain
    callback(readLineSync.question "Steam guard code (#{domain}): ")
  else
    secret = readLineSync.question "Two-factor shared secret: ", hideEchoBack: true
    callback SteamTotp.generateAuthCode(secret)

client.on 'sentry', (sentry) ->
  database[username].sentry = sentry.toString('base64')
  jsonfile.writeFileSync 'database.json', database
  _.delay process.exit, 500, 0

client.on 'loggedOn', (details) ->
  console.log "Logged into Steam as '#{username}' #{client.steamID?.getSteam3RenderedID()} => #{client.steamID?.getSteam2RenderedID()}"
  console.log "Saving data."
  database[username] = password: password, games: [10, 730]
  database[username].secret = secret if secret
  jsonfile.writeFileSync 'database.json', database
  _.delay process.exit, 2000, 0

client.on 'error', (err) ->
  console.log "Error: #{err}"
