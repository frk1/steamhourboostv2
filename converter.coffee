_        = require 'lodash'
jsonfile = require 'jsonfile'
jsonfile.spaces = 2

try
  old = jsonfile.readFileSync 'db.json'
catch e
  console.log 'No db.json found!'
  process.exit 0

database = {}
_.forEach old, (entry) ->
  database[entry.accountName] =
    password: entry.password
    games: if entry.games then _.map entry.games, _.toInteger else [10, 730]
    sentry: entry.shaSentryfile

jsonfile.writeFileSync 'database.json', database
