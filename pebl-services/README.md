## MCPD7 PeBL Services
Setting up the PeBL Services server is pretty straightforward, but does require setting a few config values.

### TL;DR
1. `git clone https://github.com/adlnet/mcdp7-pebl`
1. `cd mcdp7-pebl/pebl-services`
1. `sudo ./install-reqs.sh`
1. `sudo ./init-ssl.sh <domain-name>`
1. `cp .env.example .env`
1. `nano .env` and change the important values (see below)
1. `sudo ./rebuild.sh`
1. `sudo ./certbot/generate.sh <domain-name>`

You should be done, so next will be setting up the `pebl-reader` server.

### Setting the `.env` Values
Only a few of these values need to change:

- `SERVER_NAME`: Public domain name for your server
- `SERVICE_PORT`: Port being used by the PeBL Services (usually 80 or 443 for SSL)
- `AUTH_DOMAIN`: The Keycloak root path of your server (usually ends with `/auth`)
- `AUTH_CLIENT_SECRET`: Create this in the Keycloak admin panel, on the Credentials tab for your `perls-client` Client

Optionally, you can also specify:

- `LRS_URL`: LRS to use for PeBL's xAPI statements
- `LRS_BASIC_AUTH`: Basic auth string to use for the LRS
- `SESSION_SECRET`: More secure string for communication between the Web Reader and the PeBL Services -- must each use the same value though.

For the original PeBL Services documentation, visit the [peblproject GitHub page](https://github.com/peblproject).
