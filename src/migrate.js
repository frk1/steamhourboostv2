import _ from "lodash"
import fs from "fs-extra"
import approot from "app-root-path"
import * as manageDB from "./database"

const moveFileToConfigFolder = filename => {
  const path = approot.resolve(filename)
  const pathDest = approot.resolve(`config/${filename}`)
  if (fs.pathExistsSync(path)) {
    fs.moveSync(path, pathDest, { overwrite: true })
    return console.log(`[+] Moved '${filename}' to config folder!`)
  }
}

const convertOldDatabaseFormat = () => {
  const path = approot.resolve("config/database.json")
  if (!fs.pathExistsSync(path)) return manageDB.write([])

  let database = manageDB.read()
  if (!_.isPlainObject(database)) return

  manageDB.write(database, "config/database.json.bak")
  database = _.map(database, (data, name) => {
    data.name = name
    return data
  })
  manageDB.write(database)
  return console.log(
    "[+] Converted database to new format! The old one has been backuped as database.json.bak"
  )
}

export default () => {
  ["database.json", "telebot.json"].forEach(moveFileToConfigFolder)
  return convertOldDatabaseFormat()
}
