#!/bin/sh

if [ $# -eq 3 ]; then
    mkdir -p ~/.ssh/
    ssh-keyscan $2 > ~/.ssh/known_hosts

    chmod 600 /ssl/privkey.pem

    ssh-keygen -y -f /ssl/privkey.pem > /ssl/privkey.pem.pub

    ssh -NT -o ServerAliveInterval=60 -o ExitOnForwardFailure=yes -i /ssl/privkey.pem -L "0.0.0.0:$3:127.0.0.1:$3" $1@$2
else
    echo "./setupTunnel.sh <username> <target ip> <port>"
fi
