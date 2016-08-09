R = require 'ramda'
moment = require 'moment'
jsonFile = require 'jsonfile'
SteamTotp = require 'steam-totp'
Telegraf = require 'telegraf'
TelegrafFlow = require 'telegraf-flow'

{Extra, Markup} = Telegraf
{Flow} = TelegrafFlow

markupHideKeyboard = Extra.markup (markup) ->
  markup.hideKeyboard true

try
  database = R.filter R.has('secret'), jsonFile.readFileSync 'database.json'
catch
  database = {}

try
  {token, admin_id} = jsonFile.readFileSync 'telebot.json'
catch e
  {token, admin_id} = obj = token: '', admin_id: 0
  jsonFile.writeFileSync 'telebot.json', obj

if token is ''
  console.error 'Please configure your telegram bot first!'
  process.exit 1

isAdmin = (ctx) ->
  if ctx.from.id is admin_id
    true
  else
    console.error "[#{moment().format()}] #{ctx.from.id} tried to request!"
    false

bot = new Telegraf token
telegrafFlow = new TelegrafFlow
bot.use Telegraf.memorySession()
bot.use telegrafFlow.middleware()

defaultFlow = new Flow 'default-flow'
defaultFlow.command '/2fa', (ctx) ->
  return if not isAdmin ctx
  ctx.flow.startForResult 'twofa-flow'
defaultFlow.command '/id', (ctx) ->
  ctx.reply "Your id is #{ctx.from.id}"
defaultFlow.onResult (ctx) -> ctx.reply ctx.flow.result, markupHideKeyboard
telegrafFlow.setDefault defaultFlow

twofaFlow = new Flow 'twofa-flow'
twofaFlow.onStart (ctx) ->
  return ctx.flow.stop() if not isAdmin ctx
  if R.keys(database).length is 0
    ctx.reply 'No accounts available'
    return ctx.flow.stop()

  ctx.reply 'Which account?', Extra.markup (markup) ->
    markup
    .resize()
    .oneTime()
    .keyboard R.keys(database), columns: 2
twofaFlow.on 'text', (ctx) ->
  return ctx.flow.restart "Unknown account!" if not R.contains ctx.message.text, R.keys(database)
  SteamTotp.getAuthCode database[ctx.message.text].secret, (err, code) ->
    if err
      ctx.reply 'Unknown error, aborting.', markupHideKeyboard
      return ctx.flow.stop()
    ctx.flow.complete code

telegrafFlow.register twofaFlow
bot.startPolling 30, 1000
