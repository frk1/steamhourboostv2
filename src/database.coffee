_         = require 'lodash'
jsonfile  = require 'jsonfile'

write = (obj, path = '') ->
  path = 'database.json' if path.length is 0
  jsonfile.writeFileSync path, obj, {spaces: 2, EOL: '\n'}

read = ->
  try
    database = jsonfile.readFileSync 'database.json'
    if _.isPlainObject database
      write database, 'database.json.bak'
      database = _.map database, (data, name) ->
        data.name = name
        data
      write database, 'database.json'
      console.log "Converted database to new format! The old one has been backuped: database.json.bak"
  catch
    database = []
  database

module.exports = {read, write}
