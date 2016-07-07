##steamhourboost v2

This new version natively supports two-factor authentication using the shared secret of your app.

To add new users to the `database.json` run coffee user.coffee and follow the instructions.

By default it will boost the games CS 1.6 and CS:GO. If you want to change the games that are being boosted, edit the `database.json` directly!

### How to install
First you need to install a recent version of `node.js`, `coffeescript` and `pm2`:

```bash
wget "https://nodejs.org/dist/latest/node-$(curl -L 'nodejs.org/dist/index.tab' | sed -n '2p' | awk '{ print $1 }')-linux-x64.tar.gz" -O /tmp/nodejs.tar.gz
sudo tar --strip-components 1 -xzvf /tmp/nodejs.tar.gz -C /usr/local
sudo npm -g install npm@latest
sudo npm -g install coffee-script pm2
```

Afterwards upload this script to your server, or clone it using `git`:

```bash
# If git is missing on your server google on how to install it.
# On Debian/Ubuntu the commend is 'sudo apt-get install git'
git clone https://github.com/frk1/steamhourboost.git
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

### How do I restart the script?

That's easy. Just tell pm2 to do so:

```bash
pm2 restart all
```

If you have multiple processes running you may want to specificy the id of the process to restart, you can find it using

```bash
pm2 ls
```
