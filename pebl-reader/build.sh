#!/bin/bash

cat << EOF
# ---------------------------------------------------- #
            _     _                      _           
           | |   | |                    | |          
 _ __   ___| |__ | |  _ __ ___  __ _  __| | ___ _ __ 
| '_ \ / _ \ '_ \| | | '__/ _ \/ _` |/ _` |/ _ \ '__|
| |_) |  __/ |_) | | | | |  __/ (_| | (_| |  __/ |   
| .__/ \___|_.__/|_| |_|  \___|\__,_|\__,_|\___|_|   
| |                                                  
|_|                             
# ---------------------------------------------------- #
EOF

echo "Handling the Git Submodule alignment ... "
git submodule update --init --recursive
git submodule foreach --recursive "git checkout tags/0.31.1"

echo "Building Libraries ... "
npm run prepare:all
npm run build

echo "Building Cloud Reader ... "
npm run dist

rm -rf ./cloud-reader 
cp -r ./dist/cloud-reader ./cloud-reader

echo "Complete!  Cloud Reader should now be available in dist/cloud-reader"