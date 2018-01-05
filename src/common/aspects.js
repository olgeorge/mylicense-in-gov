const SafeJSON = require('./SafeJSON');
const _ = require('lodash');

const stringifyArgs = args => args.map(SafeJSON.stringify).join(', ');

const logStart = (methodName, args) => {
    args = stringifyArgs(args);
    console.log(`Entering method ${methodName} with arguments: ${args}`);
};
const logSuccess = (methodName, args, returnValue) => {
    args = stringifyArgs(args);
    returnValue = SafeJSON.stringify(returnValue);
    console.log(`Exiting method ${methodName} with arguments: ${args} and result: ${returnValue}`);
};
const logFailure = (methodName, args, error) => {
    args = stringifyArgs(args);
    console.log(`Error in method ${methodName} with arguments: ${args}`);
    if (!error.alreadyLoggedVerbose) {
        error.alreadyLoggedVerbose = true;
        console.error(error);
    } else {
        console.error(error.message);
    }
};
const logRetryableFailure = (methodName, args, error) => {
    args = stringifyArgs(args);
    console.log(`Retryable error in method ${methodName} with arguments: ${args}. Retrying`);
    console.error(error);
};
const logNoRetryableAttempts = (methodName, args) => {
    args = stringifyArgs(args);
    console.log(`No retryable attempts left for method ${methodName} with arguments: ${args}`);
};
const logCacheHit = (methodName, args) => {
    args = stringifyArgs(args);
    console.log(`Returning cached value for method ${methodName} with arguments: ${args}`);
};

const isPromise = maybePromise => maybePromise && maybePromise.then;

/**
 * Aspect will log the invocation of the method with parameters,
 * then the result of the successful invocation or the exception that was thrown
 * (or included in a rejected promise)
 *
 * Usage:
 * class MyClass {
 *   @Loggable
 *   methodToLog(x) { console.log(x) }
 * }
 *
 * Works only on methods of a class
 */
exports.Loggable = (target, key, descriptor) => {
    const method = descriptor.value;
    const methodName = `${target.constructor.name}::${key}`;
    descriptor.value = function (...args) {
        logStart(methodName, args);
        let maybePromise = null;

        try {
            maybePromise = method.apply(this, args);
        } catch (err) {
            logFailure(methodName, args, err);
            throw err;
        }

        if (isPromise(maybePromise)) {
            return maybePromise.then(result => {
                logSuccess(methodName, args, result);
                return result;
            }).catch(err => {
                logFailure(methodName, args, err);
                throw err;
            });
        } else {
            logSuccess(methodName, args, maybePromise);
            return maybePromise;
        }
    };
};

const waitForMs = (timeMs) => new Promise(r => setTimeout(r, timeMs));

const isPlainObject = obj => obj && obj.constructor.name === 'Object';

const retryable = ({
    errorMatcher = () => true,
    retryCount = 3,
    backoffMs = [0, 100, 200, 400, 800, 1600, 3200, 6400],
}) => (target, key, descriptor) => {
    const method = descriptor.value;
    const methodName = `${target.constructor.name}::${key}`;
    descriptor.value = async function (...args) {
        let error = null;
        for (let retryIndex = 0; retryIndex < retryCount; retryIndex++) {
            try {
                return await method.apply(this, args);
            } catch (err) {
                if (errorMatcher(err)) {
                    error = err;
                    logRetryableFailure(methodName, args, err);
                    await waitForMs(backoffMs[retryIndex]);
                } else {
                    throw err;
                }
            }
        }
        logNoRetryableAttempts(methodName, args);
        throw error;
    };
};

/**
 * Aspect will execute the function and catch the rejected promise.
 * If the error in it matches the errorMatcher, the operation will be repeated.
 * It will be repeated for retryCount times with backoffs of backoffMs
 *
 * Usage:
 * class MyClass {
 *   @Retryable({ errorMatcher: () => true, retryCount: 1, backoffMs: [1000] })
 *   methodToLog() { return Promise.reject('test'); }
 * }
 *
 * Usage:
 * class MyClass {
 *   @Retryable // Uses default parameters
 *   methodToLog() { return Promise.reject('test'); }
 * }
 *
 * Works only on methods of a class
 */
exports.Retryable = (targetOrParams, maybeKey, maybeDescriptor) => {
    if (isPlainObject(targetOrParams)) {
        return retryable(targetOrParams);
    } else {
        return retryable({})(targetOrParams, maybeKey, maybeDescriptor);
    }
};

/**
 * Aspect will cache the function result for the given input arguments.
 * Caches only when a value is returned (error is not thrown) and it is not undefined;
 * Works on both sync and async functions (return value can be a promise or a value)
 *
 * Usage:
 * class MyClass {
 *   @Cachable
 *   methodToCache(inputArgs) { return Promise.resolve('test'); }
 * }
 *
 * Works only on methods of a class
 */
exports.Cachable = (target, key, descriptor) => {
    let returnValueIsPromise = undefined;
    // TODO: add a limited memory FIFO cache
    const cache = {};
    const method = descriptor.value;
    const methodName = `${target.constructor.name}::${key}`;
    descriptor.value = function (...args) {
        const cacheKey = JSON.stringify(args);
        if (cache[cacheKey] !== undefined) {
            logCacheHit(methodName, args);
            if (returnValueIsPromise) {
                return Promise.resolve(cache[cacheKey]);
            }
            return cache[cacheKey];
        }
        let maybePromise = method.apply(this, args);
        if (isPromise(maybePromise)) {
            returnValueIsPromise = true;
            return maybePromise.then(result => {
                cache[cacheKey] = result;
                return result;
            });
        } else {
            returnValueIsPromise = false;
            cache[cacheKey] = maybePromise;
            return maybePromise;
        }
    };
};
