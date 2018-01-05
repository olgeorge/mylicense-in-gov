const moment = require('moment');

const ISO_TIMESTAMP_FORMAT_MS = 'YYYY-MM-DDTHH:mm:ss.SSS';
const ISO_TIMESTAMP_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const URL_ENCODED_ISO_TIMESTAMP_FORMAT = 'YYYYMMDDTHHmmssZ';

/**
 * Convert timestamp in format '2017-06-03T20:31:38.001Z' to format 1496521898001
 */
exports.isoToEpochMs = (timestampIsoMs) => moment(timestampIsoMs).valueOf();

/**
 * Convert timestamp in format '2017-06-03T20:31:38Z' to format 1496521898
 */
exports.isoToEpoch = (timestampIso) => moment(timestampIso).unix();

/**
 * Convert timestamp in format 1496521898001 to format '2017-06-03T20:31:38.001Z'
 */
exports.epochToIsoMs = (timestampEpochMs) => moment(timestampEpochMs)
    .utc().format(ISO_TIMESTAMP_FORMAT_MS) + 'Z';

/**
 * Convert timestamp in format 1496521898 to format '2017-06-03T20:31:38Z'
 */
exports.epochToIso = (timestampEpoch) => moment(timestampEpoch * 1000)
    .utc().format(ISO_TIMESTAMP_FORMAT) + 'Z';

/**
 * Return current timestamp in format '2017-06-03T20:31:38.001Z'
 */
exports.nowIsoMs = () => moment().utc().format(ISO_TIMESTAMP_FORMAT_MS) + 'Z';

/**
 * Return current timestamp in format '2017-06-03T20:31:38Z'
 */
exports.nowIso = () => moment().utc().format(ISO_TIMESTAMP_FORMAT) + 'Z';

/**
 * Return current timestamp in epoch milliseconds
 */
exports.nowEpochMs = () => moment().valueOf();

/**
 * Convert timestamp in format '20170603T203138Z' to format '2017-06-03T20:31:38Z'
 */
exports.urlEncodedIsoToIso = (timestampUrlEncodedIso) =>
    moment(timestampUrlEncodedIso, URL_ENCODED_ISO_TIMESTAMP_FORMAT)
        .utc().format(ISO_TIMESTAMP_FORMAT) + 'Z';

/**
 * Takes an object as input, and creates a proxy, whose methods are redirected to the original object
 * and are wrapped into a promise
 */
exports.createPromisifiedObject = object => {
    const promisifiedObject = methodName => {
        if (!object[methodName]) {
            throw `Object doesn't have method ${methodName}`;
        }
        const method = object[methodName].bind(object);
        return (...input) => {
            return new Promise((resolve, reject) => {
                method(...input, (error, response) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(response);
                    }
                });
            });
        };
    };

    const handler = {
        get: (target, name) => target(name)
    };

    return new Proxy(promisifiedObject, handler);
};

/**
 * Take a Lambda object with a handler() method returning a promise and returns a function with a callback.
 * Useful to build promise-based lambda functions and convert them to the format AWS expects.
 */
exports.depromisifyLambda = lambda => (event, context, callback) => {
    lambda.handler(event, context).then(response => {
        callback(null, response);
    }).catch(err => {
        callback(err);
    })
};

exports.getAuthHeaderBearer = authHeader => {
    const bearer = "Bearer ";
    if (!authHeader || !authHeader.startsWith(bearer)) {
        return null;
    }

    return authHeader.substring(bearer.length);
};

exports.buildAuthHeaderBearer = bearer => ({ "Authorization": `Bearer ${bearer}` });
