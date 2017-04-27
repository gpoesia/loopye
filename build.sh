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
browserify build/app.js --s loopye > bundle.js

if [[ $1 == "--release" ]]
then
  node minify_bundle.js
fi

browserify build/test/test_app.js --s loopye > test_bundle.js
