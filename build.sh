#!/bin/bash
# Copied from tungsten
export REACT_APP_GDC_DISPLAY_SLIDES=true
export REACT_APP_SLIDE_IMAGE_ENDPOINT=""
export REACT_APP_COMMIT_HASH=`git rev-parse --short HEAD`
export REACT_APP_COMMIT_TAG=`git tag -l --points-at HEAD`
export REACT_APP_API="/endpoint/"
export REACT_APP_GDC_AUTH="/auth/"
export GDC_BASE="/"
export NODE_ENV=production
export REACT_APP_COMMIT_HASH=$TRAVIS_COMMIT
unset REACT_APP_AWG
unset REACT_APP_IS_AUTH_PORTAL
npm run build
