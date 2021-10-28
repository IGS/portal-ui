#!/bin/bash
# Copied from tungsten
export REACT_APP_COMMIT_HASH=`git rev-parse --short HEAD`
export REACT_APP_COMMIT_TAG=`git tag -l --points-at HEAD`
export REACT_APP_API="/endpoint/"
export REACT_APP_GDC_AUTH="/auth/"
export REACT_APP_FENCE=""
export GDC_BASE="/"
export REACT_APP_GDC_AUTH_API=""
export REACT_APP_AWG=true
export REACT_APP_IS_AUTH_PORTAL=true
npm run build
