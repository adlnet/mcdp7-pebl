## MCDP7 PeBL Stack
Simple PeBL stack for deploying the MCDP7 EPub.

### TL;DR
1. Choose an LRS or deploy your own
2. Stand up the `pebl-auth` server
3. Stand up the `pebl-services` server and configure it to use the `pebl-auth` server and your desired LRS
4. Stand up the `pebl-reader` server and point it at the `pebl-services` server
