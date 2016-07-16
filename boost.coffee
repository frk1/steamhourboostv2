_            = require 'lodash'
readLineSync = require 'readline-sync'
jsonfile     = require 'jsonfile'
moment       = require 'moment'
SteamAccount = require './steamaccount.coffee'

try
  database = jsonfile.readFileSync 'database.json'
catch e
  console.log "Error reading database.json!"
  process.exit 0

pad = 24 + _.maxBy(_.keys(database), 'length').length
accounts = _.map database, ({password, sentry, secret, games}, name) ->
  games ?= [10, 730]
  new SteamAccount name, password, sentry, secret, games, pad

startBoost = ->
  _.forEach accounts, _.method 'boost'

restartBoost = ->
  console.log '\n---- Restarting accounts ----\n'
  _.forEach accounts, _.method 'logoff'
  _.delay startBoost, 30000
  _.delay restartBoost, 1800000

console.log '\n---- Starting to boost ----\n'
startBoost()
_.delay restartBoost, 1800000
