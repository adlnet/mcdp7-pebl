#!/bin/sh

cp /srv/dist/serverConfig.json /srv/dist/serverConfigLive.json

TLS_PRIVATE_KEY_PATH=/ssl/privkey.pem
TLS_CERTIFICATE_PATH=/ssl/fullchain.pem

sed -i "s|__SERVER_NAME__|$SERVER_NAME|g" /srv/dist/serverConfigLive.json
sed -i "s|__CONSUMING_DOMAINS__|$CONSUMING_DOMAINS|g" /srv/dist/serverConfigLive.json
sed -i "s|__TLS_PRIVATE_KEY_PATH__|$TLS_PRIVATE_KEY_PATH|g" /srv/dist/serverConfigLive.json
sed -i "s|__TLS_CERTIFICATE_PATH__|$TLS_CERTIFICATE_PATH|g" /srv/dist/serverConfigLive.json
sed -i "s|__AUTH_PROVIDER_URL__|$AUTH_PROVIDER_URL|g" /srv/dist/serverConfigLive.json
sed -i "s|__AUTH_CLIENT_SECRET__|$AUTH_CLIENT_SECRET|g" /srv/dist/serverConfigLive.json
sed -i "s|__AUTH_CLIENT_ID__|$AUTH_CLIENT_ID|g" /srv/dist/serverConfigLive.json
sed -i "s|__SERVER_AUTH_REDIRECT_URL__|$SERVER_AUTH_REDIRECT_URL|g" /srv/dist/serverConfigLive.json
sed -i "s|__AUTH_RESPONSE_TYPES__|$AUTH_RESPONSE_TYPES|g" /srv/dist/serverConfigLive.json
sed -i "s|__AUTH_SCOPE__|$AUTH_SCOPE|g" /srv/dist/serverConfigLive.json
sed -i "s|__POSTGRES_SQL_URL__|$POSTGRES_SQL_URL|g" /srv/dist/serverConfigLive.json
sed -i "s|__AUTH_METHOD__|$AUTH_METHOD|g" /srv/dist/serverConfigLive.json
sed -i "s|__REDIS_HOST__|$REDIS_HOST|g" /srv/dist/serverConfigLive.json
sed -i "s|__REDIS_PORT__|$REDIS_PORT|g" /srv/dist/serverConfigLive.json
sed -i "s|__REDIS_USER__|$REDIS_USER|g" /srv/dist/serverConfigLive.json
sed -i "s|__REDIS_AUTH__|$REDIS_AUTH|g" /srv/dist/serverConfigLive.json
sed -i "s|__SESSION_SECRET__|$SESSION_SECRET|g" /srv/dist/serverConfigLive.json
# sed -i "s|__LOGGING_DIRECTORY__|$LOGGING_DIRECTORY|g" /srv/dist/serverConfigLive.json
sed -i "s|__SERVER_PORT__|$SERVER_PORT|g" /srv/dist/serverConfigLive.json
sed -i "s|__USE_SSL__|$USE_SSL|g" /srv/dist/serverConfigLive.json
sed -i "s|__LRS_URL__|$LRS_URL|g" /srv/dist/serverConfigLive.json
sed -i "s|__LRS_BASIC_AUTH__|$LRS_BASIC_AUTH|g" /srv/dist/serverConfigLive.json
#sed -i "s|__USE_PROXY__|$USE_PROXY|g" /srv/dist/serverConfigLive.json
sed -i "s|__USE_PROXY__|false|g" /srv/dist/serverConfigLive.json
sed -i "s|__PUBLISHING_SERVICE_URL__|$PUBLISHING_SERVICE_URL|g" /srv/dist/serverConfigLive.json
sed -i "s|__PUBLISHING_SERVICE_SECRET__|$PUBLISHING_SERVICE_SECRET|g" /srv/dist/serverConfigLive.json
sed -i "s|__EPUB_TEMP_UPLOAD_PATH__|$EPUB_TEMP_UPLOAD_PATH|g" /srv/dist/serverConfigLive.json

cd /srv/dist/

node main.js serverConfigLive.json
