# PeBL services

## Pre-requisites

### Compile Dependencies

* npm       6.14.4+
* nodejs    13.14.0+

#### Compile

`npm install`
`npm run compile`

This will create a dist folder.

The dist folder and the package.json together form the PeBL services installer.

Copy the dist folder and the package.json to a new folder to generate the full bundle for deployment.

Within the new folder with the dist folder and package.json run

`npm install --production`

The above command will create a `node_modules` folder with only the runtime dependencies needed for PeBL services.

The complete services package is:

* node_modules folder
* dist folder
* package.json (optional)

Which ideally are zipped together and sent to the server that will host the PeBL Services

This folder structure should be maintained at the install site.

## Wiki 

https://github.com/peblproject/PeBL-Services/wiki/Deploying-PeBL-Services

# Misc ssh restriction

command="echo 'Port forwarding for only.'",restrict,port-forwarding,permitopen="localhost:6379",permitopen="127.0.0.1:6379"  
