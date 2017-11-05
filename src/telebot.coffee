_        = require 'lodash'
R        = require 'ramda'
Fuse     = require 'fuse.js'
Promise  = require 'bluebird'
moment   = require 'moment'
Telegraf = require 'telegraf'
Markup   = require 'telegraf/markup'

jsonfile  = require 'jsonfile'
jsonfile.spaces = 2

totp = Promise.promisify require('steam-totp').getAuthCode

try
  database = jsonfile.readFileSync 'database.json'
  if _.isPlainObject database
    jsonfile.writeFileSync 'database.json.bak', database
    tmp = _.map database, (data, name) ->
      data.name = name
      data
    json.writeFileSync 'database.json', tmp
    database = tmp
    console.log "Converted database to new format! The old one has been backuped: database.json.bak"
  database = R.filter R.has('secret'), database
catch
  database = []

try
  {token, admin_id} = jsonfile.readFileSync 'telebot.json'
catch e
  {token, admin_id} = obj = token: '', admin_id: 0
  jsonfile.writeFileSync 'telebot.json', obj

if token is ''
  console.error 'Please configure your telegram bot first!'
  process.exit 1

validate_admin = (ctx, next) ->
  if ctx.from.id is admin_id
    next()
  else
    console.error "[#{moment().format()}] #{ctx.from.id} tried to request!"
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
    fmt += "`- #{a}`"
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

bot.startPolling()
