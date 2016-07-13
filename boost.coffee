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

pad = "[#{moment().format('YYYY-MM-DD HH:mm:ss')} - #{_.maxBy(_.keys(database), 'length')}]".length

_.forEach database, (data, name) ->
  data.games ?= [10, 730]
  new SteamAccount(name, data.password, data.sentry, data.secret, data.games, pad).boost()
