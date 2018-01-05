#!/bin/bash
export STAGE=${1:-dev}
export VAULT_PASSWORD=${2}
export AWS_PROFILE=${3:-default}

echo Starting the deployment on stage ${STAGE}

echo Decrypting secrets file
./node_modules/.bin/serverless decrypt -s ${STAGE} -p ${VAULT_PASSWORD}

echo Starting the Lambda code deployment
./node_modules/.bin/serverless deploy --stage ${STAGE} --aws-profile ${AWS_PROFILE}

#rm -rf build

echo Completed the deployment on stage ${STAGE}
