import R from "ramda"
import Fuse from "fuse.js"
import Promise from "bluebird"
import moment from "moment"
import Telegraf from "telegraf"

import * as manageDB from "./database"
const database = manageDB.read()

const totp = Promise.promisify(require("steam-totp").getAuthCode)
let token, admin_id

try {
  ({ token, admin_id } = manageDB.read("config/telebot.json"))
} catch (e) {
  token = ""
  admin_id = 0
  manageDB.write({ token, admin_id }, "config/telebot.json")
}

const validate_admin = (ctx, next) => {
  if (ctx.from.id === admin_id) return next()

  console.error(`[#] [${moment().format()}] ${ctx.from.id} tried to request!`)
  return ctx.replyWithMarkdown(`\
You *do not* have the permission to use this bot!

Your telegram id is: \`${ctx.from.id}\`\
`)
}

const bot = new Telegraf(token)
bot.use(validate_admin)
bot.command("cancel", ctx => ctx.scene.leave())

const fuzzy = (query = "") => {
  if (database.length === 0) return []
  if (query.length === 0) return R.pluck("name", database)

  const fuse = new Fuse(database, {
    id: "name",
    keys: ["name"],
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 0
  })
  return fuse.search(query)
}

bot.command("list", ctx => {
  const query = ctx.message.text.length < 6 ? "" : ctx.message.text.substr(6)
  let fmt = "The following accounts are available:\n"
  fuzzy(query).map(a => (fmt += `\`- ${a}\`\n`))
  return ctx.replyWithMarkdown(fmt)
})

bot.hears(/(.*)/, ctx => {
  const [name] = Array.from(fuzzy(ctx.message.text))
  if (name) {
    const acc = R.find(R.propEq("name", name), database)
    return totp(acc.secret)
      .then(code =>
        ctx.replyWithMarkdown(`\
Selected account *${acc.name}*.

2FA-Code: \`${code}\`\
`)
      )
      .catch(err =>
        ctx.replyWithMarkdown(`\
Selected account *${acc.name}*.

Error: \`${err}\`\
`)
      )
  }
  return ctx.replyWithMarkdown(`\
Could not find a matching account!

Try */list* to get a list of available accounts!\
`)
})

const start = () => {
  if (token === "") return console.log(
      "[!] If you want to use the telegram bot please set a valid token in telebot.json!"
    )

  console.log("[=] Start Telegram bot")
  return bot.startPolling()
}

export default start
