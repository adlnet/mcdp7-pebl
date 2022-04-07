#!/bin/sh

sed -ie "s|HTTP_SERVICES_ENDPOINT|$HTTP_SERVICES_ENDPOINT|g" /usr/share/nginx/reader/scripts/config.js
sed -ie "s|WS_SERVICES_ENDPOINT|$WS_SERVICES_ENDPOINT|g" /usr/share/nginx/reader/scripts/config.js

sed -ie "s|USE_SERVICES_LOGIN|$USE_SERVICES_LOGIN|g" /usr/share/nginx/reader/scripts/config.js
sed -ie "s|USE_GUEST_LOGIN|$USE_GUEST_LOGIN|g" /usr/share/nginx/reader/scripts/config.js

nginx -g "daemon off;"
