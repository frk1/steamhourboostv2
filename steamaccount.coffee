_               = require 'lodash'
SteamUser       = require 'steam-user'
SteamTotp       = require 'steam-totp'
moment          = require 'moment'
padRight        = require 'pad-right'

module.exports = class SteamAccount
  constructor: (@name, @password, @sentry, @secret, @games, @indent = 0) ->
    @client = new SteamUser
    @client.setOption 'promptSteamGuardCode', false
    @client.setOption 'dataDirectory', null if @sentry
    @client.setSentry Buffer.from(@sentry, 'base64') if @sentry
    @client.on 'error', @error

  logheader: =>
    padRight "[#{moment().format('YYYY-MM-DD HH:mm:ss')} - #{@name}]", @indent, ' '

  login: =>
    @client.logOn
      accountName: @name,
      password: @password,
      twoFactorCode: SteamTotp.generateAuthCode(@secret) if @secret

  logoff: =>
    @client.logOff()

  boost: =>
    @client.once 'loggedOn', (details) =>
      @client.setPersona SteamUser.EPersonaState.Offline
      @client.gamesPlayed @games
      console.log "#{@logheader()} Starting to boost games!"
    @login()

  error: (err) =>
    console.log "#{@logheader()} #{err}"
