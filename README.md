[![GitHub package version](https://img.shields.io/github/package-json/v/frk1/steamhourboostv2.svg)](https://github.com/frk1/steamhourboostv2/tree/master)
[![Known Vulnerabilities](https://snyk.io/test/github/frk1/steamhourboostv2/badge.svg)](https://snyk.io/test/github/frk1/steamhourboostv2)
[![Docker Automated build](https://img.shields.io/docker/automated/frk1/steamhourboostv2.svg)](https://hub.docker.com/r/frk1/steamhourboostv2/)
[![Docker Build Status](https://img.shields.io/docker/build/frk1/steamhourboostv2.svg)](https://hub.docker.com/r/frk1/steamhourboostv2/)
[![GitHub stars](https://img.shields.io/github/stars/frk1/steamhourboostv2.svg?style=social&label=Stars)](https://github.com/frk1/steamhourboostv2)
[![GitHub forks](https://img.shields.io/github/forks/frk1/steamhourboostv2.svg?style=social&label=Fork)](https://github.com/frk1/steamhourboostv2)

## steamhourboost v2

A new version of an application for boosting the hours of Steam games. The new version supports two-factor authentication using a shared secret key.

New users can be added to the `config/database.json`. Just run `npm run user` and follow the instructions.

By default the application will boost CS 1.6 and CS:GO. The boosted game can be changed by editing the `config/database.json`.

### Installation
Install a (version `>= 8.9.0`) `node` and `pm2`. Clone the steamhourboostv2 repository and install dependencies:

```bash
apt-get update -yq                                                    && \
apt-get install -yq git make curl                                     && \
curl -L https://git.io/n-install | N_PREFIX=~/.n bash -s -- -y latest && \
source /root/.bashrc                                                  && \
npm install -g pm2 yarn                                               && \
cd ~                                                                  && \
git clone https://github.com/frk1/steamhourboostv2.git                && \
cd steamhourboostv2                                                   && \
yarn install --production                                             && \
clear                                                                 && \
echo "Done. Run 'npm run user' to add users!"
```

### Usage

Accounts can be added with `npm run user`. Start the script using `pm2`:

```bash
# Start boosting and telegram bot
npm run pm2

# Alternate command
pm2 start lib/app.js
```

To start the application **without** pm2:

```bash
# Start boosting and telegram bot.
npm run app

# Alternate command
node lib/app.js
```

### The database.json format

The configuration files are saved in the `config` subfolder.
If files need to be edited, remember to also edit the files **inside the config folder**!

steamhourboost will automatically convert the old database and move it if necessary.

A backup of the old database will be created as `database.json.bak`.

### Restarting the application

Just do the following:

```bash
pm2 restart all
```

If multiple processes are running, the ID of the process to be restarted must be specified.  The ID can be found using:

```bash
pm2 ls
```

### Docker

[Steamhourboost](https://hub.docker.com/r/frk1/steamhourboostv2/) can be used Docker. Copy the `docker-compose.yml` and run it.
The `develop` branch is selected by default. To change branches, edit the compose file to target the `latest` tag.

The images are based on [mhart/alpine-node](https://github.com/mhart/alpine-node) and are as minimal as possible.

## Telegram Bot

An optional telegram bot is included to generate 2FA tokens using telegram.

To use the Telegram Bot, [acquire a bot token from *@BotFather*](https://core.telegram.org/bots#6-botfather).

The first execution of steamhourboost will create an empty `config/telebot.json`. Set the bot token and restart the application.

To find out the id, write anything to the bot.

Set the id as `admin_id` in the `config/telebot.json` and restart the application.

That's it! The bot is now waiting for requests. Ask him about tokens! Just enter the username (or something close similar) and it will generate the key:

![telebot](https://raw.githubusercontent.com/frk1/steamhourboostv2/master/docs/telebot.gif)
