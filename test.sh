#!/bin/bash
export STAGE=${1:-dev}

echo Sending ping request to stage ${STAGE}

curl https://xxxxxxxxxx.execute-api.eu-west-1.amazonaws.com/${STAGE}/ping
