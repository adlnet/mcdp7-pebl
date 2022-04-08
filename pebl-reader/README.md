## MCDP7 PeBL Reader
This folder includes a pre-built version of the PeBL Web Reader code with the MCDP7 Epub.

## Installation
On an Ubuntu-like OS:

1. `git clone https://github.com/adlnet/mcdp7-pebl`
1. `cd mcdp7-pebl/pebl-auth`
1. `sudo ./install-reqs.sh`
1. `sudo ./init-ssl.sh <domain-name>`
1. `cp .env.example .env`
1. `nano .env` and change the important values (see below)
1. `sudo ./rebuild.sh`
1. `sudo ./certbot/generate.sh <domain-name>`

### Setting the `.env` Values
For the `.env` file, only a few values need to change for the reader:

- `HOSTNAME`: Public domain name of the server being used
- `PEBL_SERVICES_HOST`: Root URL of the PeBL Services server (something like pebl-services.example.com)

Optionally, there are other values for specifying whether or not to allow Guest Login.

For more information, see the original documentation on the [peblproject GitHub page](https://github.com/peblproject).
