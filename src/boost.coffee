_            = require 'lodash'
R            = require 'ramda'
moment       = require 'moment'
Promise      = require 'bluebird'

jsonfile     = require 'jsonfile'
jsonfile.spaces = 2

SteamAccount = require './steamaccount.coffee'

try
  database = jsonfile.readFileSync 'database.json'
  if _.isPlainObject database
    jsonfile.writeFileSync 'database.json.bak', database
    tmp = _.map database, (data, name) ->
      data.name = name
      data
    json.writeFileSync 'database.json', tmp
    database = tmp
    console.log "Converted database to new format! The old one has been backuped: database.json.bak"
catch e
  console.error e
  console.log "Error reading database.json!"
  process.exit 0

pad = 24 + _.maxBy(R.pluck('name', database), 'length').length
accounts = database.map ({name, password, sentry, secret, games}) ->
  new SteamAccount name, password, sentry, secret, games, pad

restartBoost = ->
  console.log '\n---- Restarting accounts ----\n'
  Promise.map accounts, _.method 'restartGames'
  .delay 1800000
  .finally restartBoost

console.log '\n---- Starting to boost ----\n'
Promise.map accounts, _.method 'boost'
.delay 1800000
.then restartBoost
