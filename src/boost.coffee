_            = require 'lodash'
R            = require 'ramda'
Promise      = require 'bluebird'

SteamAccount = require './steamaccount.coffee'
manageDB     = require './database'
database     = manageDB.read()

pad = 24 + _.maxBy(R.pluck('name', database), 'length').length
accounts = database.map ({name, password, sentry, secret, games}) ->
  new SteamAccount name, password, sentry, secret, games, pad

restartBoost = ->
  console.log '\n---- Restarting accounts ----\n'
  Promise.map accounts, _.method 'restartGames'
  .delay 1800000
  .finally restartBoost

console.log '\n---- Starting to boost ----\n'
Promise.map accounts, _.method 'boost'
.delay 1800000
.then restartBoost
