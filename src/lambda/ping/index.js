const utils = require('../../common/utils');
const buildLambdaApi = require('../../builders/buildLambdaApi');
const { Loggable } = require('../../common/aspects');

class Lambda {

    @Loggable
    ping() {
        return "pong";
    }
}

module.exports = buildLambdaApi(new Lambda())
    .get('/ping', (lambda, request) => lambda.ping());
