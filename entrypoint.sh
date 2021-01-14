#!/bin/sh

MODULE_DIR="/export/portal-ui/node_modules"
DIST_DIR="/export/portal-ui/dist"

# if node modules dir does not exist or if it is not empty
if [ ! -d $MODULE_DIR ] || [ "$(ls -A $MODULE_DIR)" ]; then
     echo "$MODULE_DIR is not empty. Skipping install"
else
    echo "$MODULE_DIR is empty. Running npm install"
    cd /export/portal-ui
    npm install
fi

# if dist dir does not exist or if it is empty
if [ ! -d $DIST_DIR ] || [ -z "$(ls -A $DIST_DIR)" ]; then
    echo "Gulp building..."
    cd /export/portal-ui
    ./node_modules/.bin/gulp build
else
    echo "Already gulp-built. Skipping gulp build"
fi

./node_modules/.bin/gulp server
