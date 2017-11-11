import fs from "fs-extra"
import approot from "app-root-path"

const write = (obj, path = "config/database.json") =>
  fs.writeJsonSync(approot.resolve(path), obj, { spaces: 2, EOL: "\n" })

const read = (path = "config/database.json") =>
  fs.readJsonSync(approot.resolve(path))

export { read, write }
