#!/bin/bash

## Take down the actual PeBL Services stuff
docker-compose down

cd ./certbot

docker-compose run certbot \
	renew --webroot \
	--register-unsafely-without-email \
	--agree-tos \
	--no-random-sleep-on-renew \
	--webroot-path=/data/letsencrypt

cd ../

## Bring the PeBL Services stuff back up
docker-compose up -d
