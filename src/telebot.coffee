_        = require 'lodash'
R        = require 'ramda'
Fuse     = require 'fuse.js'
approot  = require 'app-root-path'
Promise  = require 'bluebird'
moment   = require 'moment'
jsonfile = require 'jsonfile'
Telegraf = require 'telegraf'
Markup   = require 'telegraf/markup'

manageDB = reqlib 'src/database'
database = manageDB.read()

totp = Promise.promisify require('steam-totp').getAuthCode

try
  {token, admin_id} = manageDB.read 'config/telebot.json'
catch e
  {token, admin_id} = obj = token: '', admin_id: 0
  manageDB.write obj, 'config/telebot.json'

validate_admin = (ctx, next) ->
  if ctx.from.id is admin_id
    next()
  else
    console.error "[#] [#{moment().format()}] #{ctx.from.id} tried to request!"
    ctx.replyWithMarkdown """
    You *do not* have the permission to use this bot!

    Your telegram id is: `#{ctx.from.id}`
    """

bot = new Telegraf token
bot.use validate_admin
bot.command 'cancel', (ctx) -> ctx.scene.leave()

fuzzy = (query = '') ->
  return [] if database.length is 0
  return R.pluck('name', database) if query.length is 0

  fuse = new Fuse database,
    id: 'name'
    keys: ['name']
    shouldSort: true
    threshold: 0.4
    location: 0
    distance: 100
    maxPatternLength: 32
    minMatchCharLength: 0
  fuse.search query

bot.command 'list', (ctx) ->
  query = if ctx.message.text.length < 6 then '' else ctx.message.text.substr(6)
  fmt = 'The following accounts are available:\n'
  fuzzy query
  .map (a) ->
    fmt += "`- #{a}`\n"
  ctx.replyWithMarkdown fmt

bot.hears /(.*)/, (ctx) ->
  [name, ...] = fuzzy ctx.message.text
  if name
    acc = R.find R.propEq('name', name), database
    totp acc.secret
    .then (code) ->
      ctx.replyWithMarkdown """
      Selected account *#{acc.name}*.

      2FA-Code: `#{code}`
      """
    .catch (err) ->
      ctx.replyWithMarkdown """
      Selected account *#{acc.name}*.

      Error: `#{err}`
      """
  else
    ctx.replyWithMarkdown """
    Could not find a matching account!

    Try */list* to get a list of available accounts!
    """

start = ->
  if token is ''
    console.log '[!] If you want to use the telegram bot please set a valid token in telebot.json!'
  else
    console.log '[=] Start Telegram bot'
    bot.startPolling()

module.exports = start
