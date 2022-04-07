#!/bin/bash

## Clear out the old / placeholder certs
rm -rf ./certbot/etc

## Take down the actual PeBL Services stuff
docker-compose down

cd ./certbot

## Run Certbot to generate SSL certs for PeBL, this will also
## spin up an Nginx container to handle the acme challenge
docker-compose run certbot \
	certonly --webroot \
	--register-unsafely-without-email --agree-tos \
	--webroot-path=/data/letsencrypt \
	-d $1

## Take the placeholder Nginx container down
docker-compose down

cd ../

## Bring the PeBL Services stuff back up
docker-compose up -d
