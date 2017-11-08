_        = require 'lodash'
approot  = require 'app-root-path'
jsonfile = require 'jsonfile'

write = (obj, path = '') ->
  path = '/config/database.json' if path.length is 0
  path = approot + path
  jsonfile.writeFileSync path, obj, {spaces: 2, EOL: '\n'}

read = ->
  path = approot + '/config/database.json'
  try
    database = jsonfile.readFileSync path
    if _.isPlainObject database
      write database, '/config/database.json.bak'
      database = _.map database, (data, name) ->
        data.name = name
        data
      write database, '/config/database.json'
      console.log "Converted database to new format! The old one has been backuped: database.json.bak"
  catch
    database = []
  database

module.exports = {read, write}
