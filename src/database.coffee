_       = require 'lodash'
fs      = require 'fs-extra'
approot = require 'app-root-path'

write = (obj, path = 'config/database.json') ->
  fs.writeJsonSync approot.resolve(path), obj, {spaces: 2, EOL: '\n'}

read = (path = 'config/database.json') ->
  fs.readJsonSync approot.resolve path

module.exports = {read, write}
