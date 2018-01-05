const axios = require('axios');
// Remove in prod
//require('axios-debug')(axios);
const { HTTP_GATEWAY_TIMEOUT_MS } = require('../common/constants.js');

module.exports = axios.create({
    baseURL: process.env.MYLICENSE_ENDPOINT,
    timeout: HTTP_GATEWAY_TIMEOUT_MS,
    headers: {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        //"Accept-Encoding": "gzip, deflate, br",
        "Accept-Encoding": "deflate, gzip",
        //"Accept-Language": "en-US,en;q=0.9,ru;q=0.8,uk;q=0.7,cy;q=0.6",
        //"Upgrade-Insecure-Requests": "1",
        //"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36",
        //"Cache-Control": "max-age=0",
        "Connection": "keep-alive",
        //"Content-Type" : "application/x-www-form-urlencoded",
        "Host" : "mylicense.in.gov",
        //"Origin" : "https://mylicense.in.gov",
        "Referer" : "https://mylicense.in.gov/everification/Search.aspx",
        "Accept-Language": "en-US,en;q=0.5",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:45.0) Gecko/20100101 Firefox/45.0",
    },
});
