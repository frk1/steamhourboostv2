_            = require 'lodash'
jsonfile     = require 'jsonfile'
moment       = require 'moment'
Promise      = require 'bluebird'
SteamAccount = require './steamaccount.coffee'

try
  database = jsonfile.readFileSync 'database.json'
catch e
  console.log "Error reading database.json!"
  process.exit 0

pad = 24 + _.maxBy(_.keys(database), 'length').length
accounts = _.map database, ({password, sentry, secret, games}, name) ->
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
