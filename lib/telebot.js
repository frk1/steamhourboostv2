"use strict"

const R = require("ramda")
const Fuse = require("fuse.js")
const Promise = require("bluebird")
const moment = require("moment")
const Telegraf = require("telegraf")

const manageDB = require("./database")
const database = manageDB.read()

const totp = Promise.promisify(require("steam-totp").getAuthCode)
let token, admin_id

try {
    ({
        token,
        admin_id
    } = manageDB.read("config/telebot.json"))
} catch (e) {
    token = ""
    admin_id = 0
    manageDB.write({
        token,
        admin_id
    }, "config/telebot.json")
}

const validate_admin = (ctx, next) => {
    if (ctx.from.id === admin_id) return next()

    console.error(`[#] [${moment().format()}] ${ctx.from.id} tried to request!`)
    return ctx.replyWithMarkdown(`You *do not* have the permission to use this bot!\n\nYour telegram id is: \`${ctx.from.id}\``)
}

const bot = new Telegraf(token)
bot.use(validate_admin)
bot.command("cancel", ctx => {
    //ctx.scene.leave()
    //UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'leave' of undefined
    //Not sure if this is the proper way to do this, but it seems to do the job so I will leave it ^^
    ctx.replyWithMarkdown(`Stopping Telegram Bot!!!`).then(_ => ctx.scene.leave())
})

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

        if (acc.secret === undefined) {
            return ctx.replyWithMarkdown(`Selected account: *${acc.name}*\n\nCouldn't find account secret!`)
        }

        return totp(acc.secret)
            .then(code =>
                ctx.replyWithMarkdown(`Selected account: *${acc.name}*\n\n2FA-Code: \`${code}\``)
            )
            .catch(err =>
                ctx.replyWithMarkdown(`Selected account: *${acc.name}*\n\nError: \`${err}\``)
            )
    }
    return ctx.replyWithMarkdown(`Could not find a matching account!\n\nTry */list* to get a list of available accounts!`)
})

module.exports = () => {
    if (token === "") return console.log(
        "[!] If you want to use the telegram bot please set a valid token in telebot.json!"
    )

    console.log("[=] Start Telegram bot")
    return bot.startPolling()
}
