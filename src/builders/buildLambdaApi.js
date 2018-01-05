const ApiBuilder = require('claudia-api-builder');

const createApiProxyForLambda = (api, lambda) => {
    const proxy = new Proxy(api, {
        get(target, name) {
            if (['get', 'post', 'put', 'patch', 'delete', 'head', 'any'].includes(name)) {
                const method = target[name];
                return (url, callbackLambdaWithRequest) => {
                    const callback = request => callbackLambdaWithRequest(lambda, request);
                    method.apply(this, [url, callback]);
                    return proxy;
                };
            } else {
                return target[name];
            }
        }
    });
    return proxy;
};

module.exports = lambda => createApiProxyForLambda(new ApiBuilder(), lambda);
