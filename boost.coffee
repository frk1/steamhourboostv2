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
  new SteamAccount name, password, sentry, secret, games, pad

restartBoost = ->
  console.log '\n---- Restarting accounts ----\n'
  _.forEach accounts, _.method 'logoff'
  _.delay _.forEach, 30000, accounts, _.method 'boost'
  _.delay restartBoost, 1800000

console.log '\n---- Starting to boost ----\n'
_.forEach accounts, _.method 'boost'
_.delay restartBoost, 1800000
