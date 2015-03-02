#!/bin/bash

# set user variables
PATH='~/.nvm/v0.10.36/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/opt/local/bin:/opt/X11/bin:/usr/local/git/bin'
USR='slack-bill-sharing'
VERSION='prod'
ROOT='dailydinities'
SERVER='delirium.cloudapp.net'

# Create User
USRSCRIPT='sudo useradd '$USR-$VERSION'; \
sudo passwd '$USR-$VERSION' \
sudo mkdir /home/'$USR-$VERSION'; \
sudo adduser '$USR-$VERSION' sudo; \
cd /home/'$USR-$VERSION'/; \
sudo chown -Rv '$USR-$VERSION' /home/'$USR-$VERSION'/; \
sudo mkdir /home/'$USR-$VERSION'/'$USR'; \
sudo chown -Rv '$USR-$VERSION' /home/'$USR-$VERSION/$USR'/'
#ssh $ROOT@$SERVER "$USRSCRIPT"

# Sign the server
pbcopy < ~/.ssh/id_rsa.pub
SIGNSCRIPT='mkdir /home/'$USR'-'$VERSION'/.ssh ;\
vi /home/'$USR'-'$VERSION'/.ssh/authorized_keys'
#ssh -t $USR-$VERSION@$SERVER "$SIGNSCRIPT"

# Install a few stuff in the server
APPSCRIPT='npm install bower -g ;\
npm install forever -g ;\
npm install azure-cli -g'
#ssh -t $USR-$VERSION@$SERVER "$APPSCRIPT"