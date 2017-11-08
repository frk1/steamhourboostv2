
4.0.1 / 2017-11-08
==================

  * 📝 Add changelog
  * 🔨 Use manageDB.read() where possible

4.0.0 / 2017-11-08
==================

  * 🔧 Update .mailmap
  * 👥 Add .mailmap
  * 🔨 Move database migration code to own file
  * 💥 Move config files to config folder
  * 🔨 If there are no games do not login
  * ✨ Add .yarnclean file
  * 🐋 Add docker-compose.yml
  * 🔥 Remove package-lock.json
  * ✨ Integrate telegram bot into app.coffee
  * 🐋 Use docker multistage feature
  * 🐋 Add .dockerignore

3.0.2 / 2017-11-07
==================

  * 🔨 Move database read/write logic to own file
  * 🔥 Remove unused dependency
  * 🚚 Fix telebot.gif path

3.0.1 / 2017-11-06
==================

  * 🐛 Add missing require in user.coffee
  * 🐋 Add Dockerfile
  * 🚀 Modernize code
  * ✨ Add .editorconfig
  * 🔧 Update coffeelint.json

3.0.0 / 2017-11-05
==================

  * 🚀 Modernize code
  * ✨ Add .editorconfig
  * 🔧 Update coffeelint.json
  * Merge pull request #4 from M0V3/patch-1
  * Fixed directory name in how to

2.3.1 / 2016-08-09
==================

  * Fix telegraf-flow incompatibility

2.3.0 / 2016-08-09
==================

  * Add telegram bot
  * Minor code cleanup
  * Update dependencies

2.2.2 / 2016-08-06
==================

  * Generate 2fa code using callback

2.2.1 / 2016-08-05
==================

  * Fix readLineSync error

2.2.0 / 2016-07-31
==================

  * Use inquirer to select games
  * Wait 1.5s for the sentry to be confirmed

2.1.1 / 2016-07-30
==================

  * Always convert gameid to integer
  * Reformat timeout error message
  * Remove dead code
  * Add missing_fat_arrows to coffeelint

2.1.0 / 2016-07-22
==================

  * Make use of Promises
  * Update steam-user to 3.11.0
  * Prefer SteamTotp callback version
  * Allow retry if 2FA failed
  * Do not try to log off if steamguard failed earlier
  * Optimize behaviour if steam guard is invalid
  * Add support for 'npm start'
  * Minor code reorganisations

2.0.4 / 2016-07-16
==================

  * Remove debug code
  * Simplify boost.coffee using lodash

2.0.3 / 2016-07-16
==================

  * Cleanup boost.coffee
  * Optimize indentation
  * Remove superfluous 'loggedOn' event listeners
  * When logging off set games played to none

2.0.2 / 2016-07-15
==================

  * Bump steam-user version
  * Fix various bugs
  * Timestamp will now display 24h time

2.0.1 / 2016-07-12
==================

  * Improve 'reliable connection' situation
  * Change timestamp format

2.0.0 / 2016-07-08
==================

  * Add minimal node version
  * Improve handling of common errors
  * Add coffeelint.json
  * Add license (MIT)
  * Add converter.coffee for old db.json style
  * Do not prompt for steamguard code in boost.coffee
  * Save sentry files automatically
  * Initial commit
