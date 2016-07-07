_               = require 'lodash'
SteamUser       = require 'steam-user'
SteamTotp       = require 'steam-totp'
moment          = require 'moment'
padRight        = require 'pad-right'

module.exports = class SteamAccount
  constructor: (@name, @password, @sentry, @secret, @games, @indent = 0) ->
    @client = new SteamUser
    @client.setOption 'dataDirectory', null
    @client.on 'error', @error

  logheader: =>
    padRight "[#{moment().format()} - #{@name}]", @indent, ' '

  login: =>
    @client.setSentry Buffer.from(@sentry, 'base64') if @sentry
    @client.logOn
      accountName: @name,
      password: @password,
      twoFactorCode: SteamTotp.generateAuthCode(@secret) if @secret

  boost: =>
    @client.on 'loggedOn', (details) =>
      @client.setPersona SteamUser.EPersonaState.Offline
      @client.gamesPlayed @games
      console.log "#{@logheader()} Starting to boost games!"

      _.delay =>
        @client.gamesPlayed []
        @client.once 'disconnected', => _.delay @login, 30000
        @client.logOff()
      , 1800000
    @login()

  error: (err) =>
    console.log "#{@logheader()} #{err}"
