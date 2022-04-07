#!/bin/bash

docker-compose run certbot \
	renew --webroot \
	--register-unsafely-without-email \
	--agree-tos \
	--no-random-sleep-on-renew \
	--webroot-path=/data/letsencrypt

## Bring the PeBL Services stuff back up
docker-compose restart pebl-reader-nginx
