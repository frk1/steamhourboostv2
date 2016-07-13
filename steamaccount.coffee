_               = require 'lodash'
SteamUser       = require 'steam-user'
SteamTotp       = require 'steam-totp'
moment          = require 'moment'
padRight        = require 'pad-right'

module.exports = class SteamAccount
  constructor: (@name, @password, @sentry, @secret, @games, @indent = 0) ->
    @client = new SteamUser
    @client.setOption 'dataDirectory', null
    @client.setOption 'promptSteamGuardCode', false
    @client.on 'error', @error

  logheader: =>
    padRight "[#{moment().format('YYYY-MM-DD HH:mm:ss')} - #{@name}]", @indent, ' '

  login: =>
    @client.setSentry Buffer.from(@sentry, 'base64') if @sentry
    @client.logOn
      accountName: @name,
      password: @password,
      twoFactorCode: SteamTotp.generateAuthCode(@secret) if @secret

  boost: =>
    @client.once 'loggedOn', (details) =>
      @client.setPersona SteamUser.EPersonaState.Offline
      @client.gamesPlayed @games
      console.log "#{@logheader()} Starting to boost games!"

      _.delay =>
        @client.gamesPlayed []
        @client.once 'disconnected', => _.delay @boost, 30000
        @client.logOff()
      , 1800000
    @login()

  error: (err) =>
    console.log "#{@logheader()} #{err}"
    switch err.eresult
      when SteamUser.EResult.LoggedInElsewhere then _.delay @boost, 1800000
      when SteamUser.EResult.NoConnection then _.delay @boost, 300000
      when SteamUser.EResult.ServiceUnavailable then _.delay @boost, 300000
      when SteamUser.EResult.AlreadyLoggedInElsewhere then _.delay @boost, 900000
      when SteamUser.EResult.LogonSessionReplaced then _.delay @boost, 30000
      else _.delay @boost, 300000
