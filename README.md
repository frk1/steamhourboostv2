[![GitHub package version](https://img.shields.io/github/package-json/v/frk1/steamhourboostv2.svg)](https://github.com/frk1/steamhourboostv2/tree/master)
[![Docker Automated build](https://img.shields.io/docker/automated/frk1/steamhourboostv2.svg)](https://hub.docker.com/r/frk1/steamhourboostv2/)
[![Docker Build Status](https://img.shields.io/docker/build/frk1/steamhourboostv2.svg)](https://hub.docker.com/r/frk1/steamhourboostv2/)
[![GitHub stars](https://img.shields.io/github/stars/frk1/steamhourboostv2.svg?style=social&label=Stars)](https://github.com/frk1/steamhourboostv2)
[![GitHub forks](https://img.shields.io/github/forks/frk1/steamhourboostv2.svg?style=social&label=Fork)](https://github.com/frk1/steamhourboostv2)

## steamhourboost v2

This new version natively supports two-factor authentication using the shared secret of your app.

To add new users to the `config/database.json` run `npm run user` and follow the instructions.

By default it will boost the games CS 1.6 and CS:GO. If you want to change the games that are being boosted, edit the `config/database.json` directly!

### How to install
First you need to install a recent version (`>= 8.9.0`) of `node`, `coffeescript` and `pm2`. Afterwards we clone the steamhourboostv2 script and install the dependencies:

```bash
apt-get update -yq                                                    && \
apt-get install -yq git make curl                                     && \
curl -L https://git.io/n-install | N_PREFIX=~/.n bash -s -- -y latest && \
source /root/.bashrc                                                  && \
npm install -g coffeescript pm2 yarn                                  && \
pm2 install coffeescript                                              && \
cd ~                                                                  && \
git clone https://github.com/frk1/steamhourboostv2.git                && \
cd steamhourboostv2                                                   && \
yarn install                                                          && \
clear                                                                 && \
echo "Done. Run 'npm run user' to add users!"
```

### How to use

After that you can add accounts using `npm run user`. When you are ready, start the script using `pm2`:

```bash
# This will start both boosting and the telegram bot.
npm run pm2

# This will work too:
pm2 start src/app.coffee
```

If you want to start the script **without** pm2 (to test for example):

```bash
# This will start both boosting and the telegram bot.
npm run app

# This will work too
coffee src/app.coffee
```

### The database.json format changed

The configuration files are now saved in the sub-folder `config`.
If you need to manually edit the files remember to edit the files **inside the config folder**!

steamhourboost will automatically convert your old database and move it if necessary.

A backup of your old database will be created as `database.json.bak`.

### How do I restart the script?

That's easy. Just tell `pm2` to do so:

```bash
pm2 restart all
```

If you have multiple processes running you may want to specify the id of the process to restart, you can find it using

```bash
pm2 ls
```

### Docker

You can use [steamhourboost](https://hub.docker.com/r/frk1/steamhourboostv2/) with Docker too. Just copy the `docker-compose.yml` and run it.
By default the `develop` branch is selected, if you want to change that edit the compose file to target the `latest` tag instead.

The images are based on [mhart/alpine-node](https://github.com/mhart/alpine-node) and are as minimal as possible.

## Telegram Bot

There is an optional telegram bot included to generate 2FA tokens using telegram.

To use it you will need to acquire a bot token from *@BotFather*. Google on how to do that.

Upon first execution steamhourboost will create an empty `config/telebot.json`. Set your bot token and restart the script.

To find out your id just write anything to the bot. If you are not authorised it will tell you your id.

Set your id as `admin_id` in the `config/telebot.json`. Now restart the script.

That's it! Your bot is now waiting for your requests. Ask him about your tokens! Just enter the username (or something close to the username) and it will generate the key:

![telebot](https://raw.githubusercontent.com/frk1/steamhourboostv2/master/docs/telebot.gif)
