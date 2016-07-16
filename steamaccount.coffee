_         = require 'lodash'
SteamUser = require 'steam-user'
SteamTotp = require 'steam-totp'
moment    = require 'moment'
padRight  = require 'pad-right'

module.exports = class SteamAccount
  constructor: (@name, @password, @sentry, @secret, @games, @indent = 0) ->
    options =
      promptSteamGuardCode: false
      dataDirectory: null
    @client = new SteamUser null, options
    @client.setSentry Buffer.from(@sentry, 'base64') if @sentry
    @client.on 'error', @error
    @client.on 'steamGuard', @onSteamGuard

  logheader: =>
    padRight "[#{moment().format('YYYY-MM-DD HH:mm:ss')} - #{@name}]", @indent, ' '

  login: =>
    @client.logOn
      accountName: @name,
      password: @password,
      twoFactorCode: SteamTotp.generateAuthCode(@secret) if @secret

  logoff: =>
    return if @steamGuardRequested
    @client.gamesPlayed []
    @client.logOff()

  error: (err) =>
    console.log "#{@logheader()} #{err}"

  onSteamGuard: =>
    @steamGuardRequested = true
    console.log "#{@logheader()} Failed, steam guard requested!"

  boost: =>
    return @onSteamGuard() if @steamGuardRequested
    @client.removeAllListeners 'loggedOn'
    @client.once 'loggedOn', (details) =>
      @client.setPersona SteamUser.EPersonaState.Offline
      @client.gamesPlayed @games ? [10, 730]
      console.log "#{@logheader()} Starting to boost games!"
    @login()
