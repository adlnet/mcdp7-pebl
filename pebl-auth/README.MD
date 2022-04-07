PeBL Auth Server 
==============

PeBL typically requires a Keycloak account to use for its user login / authentication.  Our version does allow guest access, but it's recommended to use an instance of PeBL that does point at a functioning Keycloak instance.

Like anything else we write, this server uses Docker and Docker Compose.  While this **should** promise a no-hassle installation process, please contact the ADL team if you encounter issues.

### TL;DR
1. `git clone https://github.com/adlnet/mcdp7-pebl`
1. `cd mcdp7-pebl/pebl-auth`
1. `sudo ./install-reqs.sh`
1. `sudo ./init-ssl.sh <domain-name>`
1. `cp .env.example .env`
1. `nano .env` and change the important values (see below)
1. `sudo ./rebuild.sh`
1. `sudo ./certbot/generate.sh <domain-name>`
1. Import the PeBL Realm file
1. Update the PeBL Client secret and keep it handy


### Setting Values for the `.env` File
There aren't many values to set here, but the important ones are:
- `KEYCLOAK_ADMIN_USER`: Username of the main Keycloak admin account
- `KEYCLOAK_ADMIN_PASSWORD`: Password for that account
- `HOSTNAME`: The public domain name where this server will be running

### Confirm Server is Operational
Once the SSL generation script runs, the Keycloak server will be available at `https://<domain-name>/auth`.  As Keycloak server itself can take a bit to spin up, it may be helpful to track the progress with:

```
sudo docker logs -f docker_keycloak
```

If you see white / yellow text that ends with "Starting with X services (Y passive / on-demand, Z lazy)", then the process started fine.
If you see a flood of red text or the ASCII java block repeating, then the service is failing and needs to be debugged.

### Adding the PeBL Realm to Keycloak

To speed things up, there's a premade PeBL realm included in this repo.  To do this:

1. Log into keycloak 
1. Move your mouse to the top-left and click the `Add Realm` button
1. Select the `pebl-realm.json` file included in this repo

After that, you should have a realm that will be used by PeBL for allowing users to log in!
