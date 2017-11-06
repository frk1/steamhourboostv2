## steamhourboost v2

This new version natively supports two-factor authentication using the shared secret of your app.

To add new users to the `database.json` run `npm run user` and follow the instructions.

By default it will boost the games CS 1.6 and CS:GO. If you want to change the games that are being boosted, edit the `database.json` directly!

### How to install
First you need to install a recent version (`>= 8.9.0`) of `nodejs`, `coffeescript` and `pm2`. Afterwards we clone the steamhourboostv2 script and install the dependencies:

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
pm2 start app.json

# This will work too:
npm run pm2

# If you only want the boosting script you can tell pm2:
pm2 start app.json --only boost
```

That's it!

### The database.json format changed

steamhourboost will automatically convert your old database.

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

## Telegram Bot

There is an optional telegram bot included to generate 2FA tokens using telegram.

To use it you will need to acquire a bot token from *@BotFather*. Google on how to do that.

Execute `npm run telebot` once and it will create an empty `telebot.json`. Set your bot token  and start the bot again.

To find out your id just write anything to the bot. If you are not authorised it will tell you your id.

Set your id as `admin_id` in the `telebot.json`. Now you can start your telegram bot using `npm run pm2`.

That's it! Your bot is now waiting for your requests. Ask him about your tokens! Just enter the username (or something close to the username) and it will generate the key:

![telebot](https://raw.githubusercontent.com/frk1/steamhourboostv2/master/docs/telebot.gif)
