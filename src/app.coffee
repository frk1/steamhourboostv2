_             = require 'lodash'
R             = require 'ramda'
Promise       = require 'bluebird'
global.reqlib = require('app-root-path').require

migrate      = reqlib 'src/migrate'
manageDB     = reqlib 'src/database'
SteamAccount = reqlib 'src/steamaccount'

migrate()
database = manageDB.read()

telebotStart = reqlib 'src/telebot'
telebotStart()

if database.length is 0
  console.error '[!] No accounts have been added! Please run \'npm run user\' to add accounts!'
  process.exit 0

pad = 24 + _.maxBy(R.pluck('name', database), 'length').length
accounts = _.compact database.map ({name, password, sentry, secret, games=[]}) ->
  if games.length > 0
    new SteamAccount name, password, sentry, secret, games, pad
  else
    null

restartBoost = ->
  console.log '[=] Restart boosting'
  Promise.map accounts, _.method 'restartGames'
  .delay 1800000
  .finally restartBoost

console.log '[=] Start boosting'
Promise.map accounts, _.method 'boost'
.delay 1800000
.then restartBoost
