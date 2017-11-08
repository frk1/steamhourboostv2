_        = require 'lodash'
fs       = require 'fs-extra'
approot  = require 'app-root-path'
manageDB = reqlib 'src/database'

moveFileToConfigFolder = (filename) ->
  path = approot.resolve filename
  pathDest = approot.resolve "config/#{filename}"
  if fs.pathExistsSync(path)
    fs.moveSync path, pathDest, overwrite: true
    console.log "[+] Moved '#{filename}' to config folder!"

convertOldDatabaseFormat = ->
  path = approot.resolve 'config/database.json'
  if not fs.pathExistsSync path
    return manageDB.write []

  database = manageDB.read()
  return if not _.isPlainObject database

  manageDB.write database, 'config/database.json.bak'
  database = _.map database, (data, name) ->
    data.name = name
    data
  manageDB.write database
  console.log "[+] Converted database to new format! The old one has been backuped as database.json.bak"

module.exports = ->
  ['database.json', 'telebot.json'].forEach moveFileToConfigFolder
  convertOldDatabaseFormat()
