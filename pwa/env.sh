#!/bin/sh

echo "@extrahorizon:registry=https://npm.pkg.github.com" > .npmrc
echo "//npm.pkg.github.com/:_authToken=${AUTH_TOKEN}" >> .npmrc
