##steamhourboost v2

This new version natively supports two-factor authentication using the shared secret of your app.

To add new users to the `database.json` run `coffee user.coffee` and follow the instructions.

By default it will boost the games CS 1.6 and CS:GO. If you want to change the games that are being boosted, edit the `database.json` directly!

### How to install
First you need to install a recent version of `node.js`, `coffee-script` and `pm2`:

```bash
wget --no-check-certificate "https://nodejs.org/dist/latest/node-$(curl -L 'nodejs.org/dist/index.tab' | sed -n '2p' | awk '{ print $1 }')-linux-x64.tar.gz" -O /tmp/nodejs.tar.gz
sudo tar --strip-components 1 -xzvf /tmp/nodejs.tar.gz -C /usr/local
sudo npm -g install npm@latest
sudo npm -g install coffee-script pm2
sudo pm2 install coffeescript
```

Afterwards upload this script to your server, or clone it using `git`:

```bash
# If git is missing on your server google on how to install it.
# On Debian/Ubuntu the command is 'sudo apt-get install git'
git clone https://github.com/frk1/steamhourboostv2.git
```

`cd` into the folder and install the dependencies

```bash
cd steamhourboost
npm install .
```

### How to use

After that you can add accounts using `coffee user.coffee`. When you are ready, start the script using `pm2`:

```bash
pm2 start boost.coffee
```

That's it!

### Can I use my old `db.json` file?

Not directly. But you can convert it:

```bash
coffee converter.coffee
```

That's it, your new `database.json` is ready!

### How do I restart the script?

That's easy. Just tell `pm2` to do so:

```bash
pm2 restart all
```

If you have multiple processes running you may want to specificy the id of the process to restart, you can find it using

```bash
pm2 ls
```

## Telegram Bot

There is an optional telegram bot included to generate 2FA tokens using telegram.

To use it you will need to aquire a bot token from *@BotFather*. Google on how to do that.

Execute `coffee telebot.coffee` once and it will create an empty `telebot.json`. Set your bot token in it and start the bot again.

Ask your bot about your id (use **telegram**, _not_ the console):

```
/id
Your id is **********
```

Set your id as `admin_id` in the `telebot.json`. Now you can start your telegram bot using `pm2 start telebot.coffee`.

That's it! Your bot is now waiting for your requests. Ask him about your `/2fa` tokens! It will ask which account you mean.
