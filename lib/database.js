"use strict"

const fs = require("fs-extra")
const approot = require("app-root-path")

const write = (obj, path = "config/database.json") =>
  fs.writeJsonSync(approot.resolve(path), obj, { spaces: 2, EOL: "\n" })

const read = (path = "config/database.json") =>
  fs.readJsonSync(approot.resolve(path))

module.exports = { read, write }
