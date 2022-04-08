## MCDP7 PeBL Stack
This repo includes a simplified version of PeBL stack for deploying just the Marine Corps Doctrinal Publication in Epub format.

Want to view MCDP7 without all of the installation hassle?  We have **[a live instance of PeBL with guest login](https://pebl.castle.adlnet.gov)** available in one of the ADL sandboxes.

### Installation 
Deploying your own PeBL stack with this repository will have a few steps:

1. Choose an LRS or deploy your own
2. Stand up the `pebl-auth` server
3. Stand up the `pebl-services` server and configure it to use the `pebl-auth` server and your desired LRS
4. Stand up the `pebl-reader` server and point it at the `pebl-services` server

Each of these steps is performed with Docker and the corresponding folders all include a simple `tl;dr` instruction set.

### Additional Info on PeBL and Deployment
For something this simple, you may be asking *"Why so many steps?"*  The PeBL system depends on a few systems for deployment.

#### 📖 The PeBL Web Reader 
This is where users actually visit to use PeBL.  The server itself is fairly lightweight, as the PeBL reader is built into a simple HTML page that calls on the PeBL Services machine for other functionality.

#### 🐕‍🦺 PeBL Services
This machine handles xAPI communication and informs the PeBL Web Reader about where to send the user for Sign-On.  As web-sockets are used, manual deployment typically requires that the 

#### 🔑 A Sign-On System
While PeBL can also work with Google as an auth provider, most deployments use an instance of Keycloak.  In this repo, the `pebl-auth` folder contains instructions for standing up your own instance of Keycloak to use.

#### 📝 An LRS (or Learning Record Store) for xAPI 
Lastly, PeBL will send xAPI statements about its usage to an LRS. 

Guest users do not have statements sent about them.


### Final Notes about PeBL and Support
While PeBL receives periodic updates for its dependencies, the codebase overall is not expected to see many feature updates or improvements in the near future.  ADL maintains a slightly modified version of the original open-source PeBL project (used here), but there may still be a few quirks given the project's size and our limited resources for supporting it.

If you have any issues, feel free to reach out to `ithelpdesk@adlnet.gov` or `trey.hayden.ctr@adlnet.gov` directly. ☕
