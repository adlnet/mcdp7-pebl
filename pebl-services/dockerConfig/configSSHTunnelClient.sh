#!/bin/sh

if [ $# -eq 5 ]
then
    chmod 600 $3
    
    echo "
[Unit]
Description=Setup a secure tunnel to $1
After=network.target

[Service]
ExecStart=/usr/bin/ssh -NT -o ServerAliveInterval=60 -o ExitOnForwardFailure=yes -i $3 -L 127.0.0.1:$5:127.0.0.1:$5 $2@$4

# Restart every >2 seconds to avoid StartLimitInterval failure
RestartSec=5
Restart=always

[Install]
WantedBy=multi-user.target
" > "/etc/systemd/system/ssh-tunnel-$1.service"

    ssh -i "$3" "$2@$4" ls

    systemctl daemon-reload    
    systemctl enable --now "ssh-tunnel-$1"    
    systemctl restart "ssh-tunnel-$1"
else
    echo "./configSSHTunnelClient.sh <service name> <username> <private-key-path> <ip of target server> <port>"
fi
