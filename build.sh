#!/bin/bash

jsx --version &> /dev/null
status=$?
if [ $status -ne 0 ]
then
    echo "jsx not found! Installing react-tools..."
    npm install -g react-tools
fi

browserify --version &> /dev/null
status=$?
if [ $status -ne 0 ]
then
    echo "browserify not found! Installing browserify..."
    npm install -g browserify
fi

echo "Installing npm requirements..."
npm install .

echo "Building file bundle.js..."
jsx src/ build/
browserify build/app.js --s comp4kids > bundle.js
browserify build/test/test_app.js --s comp4kids > test_bundle.js
