#!/bin/bash

## Clear out the old / placeholder certs
rm -rf ./certbot/etc

## Run Certbot to generate SSL certs for PeBL, this will also
## spin up an Nginx container to handle the acme challenge
docker-compose run certbot \
	certonly --webroot \
	--register-unsafely-without-email --agree-tos \
	--webroot-path=/data/letsencrypt \
	-d $1

## Bring the PeBL Services stuff back up
docker-compose restart pebl-reader-nginx
