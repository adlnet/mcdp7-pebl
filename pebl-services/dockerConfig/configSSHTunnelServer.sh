#!/bin/sh

if [ $# -eq 2 ]
then
    id -u "$1"

    if [ $? -eq 1 ]; then
        useradd -m "$1"
    fi

    mkdir -p "/home/$1/.ssh"
    touch "/home/$1/.ssh/authorized_keys"
    chmod 700 "/home/$1/.ssh"
    chmod 600 "/home/$1/.ssh/authorized_keys"
    chown "$1:$1" -R "/home/$1/.ssh"

    ssh-keygen -b 3072 -f "$1"

    pubkey=$(cat "$1.pub")
    echo "command=\"echo 'Port forwarding for only.'\",restrict,port-forwarding,permitopen=\"localhost:$2\",permitopen=\"127.0.0.1:$2\" $pubkey" > "/home/$1/.ssh/authorized_keys"
else
    echo "./configSSHTunnelServer.sh <username> <port>"
fi
