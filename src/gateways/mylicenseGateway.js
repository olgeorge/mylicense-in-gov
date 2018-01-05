const _ = require('lodash');
const { Loggable } = require('../common/aspects');
const mylicenseClient = require('../clients/mylicenseClient');
const cheerio = require('cheerio');
const setCookie = require('set-cookie-parser');
const querystring = require('querystring');

const { MYLICENSE_ENDPOINT } = process.env;

const getSelectOptionsFromPage = async (webPage, selectName) => {
    const $ = cheerio.load(webPage);
    return $(`select[name=${selectName}]`).children().map(function (i, el) {
        return $(this).text();
    }).get();
};

const getSearchResultsFromPage = (webPage) => {
    const $ = cheerio.load(webPage);
    const numPages = parseInt($(`#datagrid_results tr[bgcolor]`).last().find('font[color=White]').children().last().text());
    const items = $(`#datagrid_results tr`).not('[bgcolor]').map(function (i, el) {
        const values = $(this).children('td').map(function (i, el) {
            return $(this).text();
        }).get();
        const link = MYLICENSE_ENDPOINT + '/everification/' + $(this).children('td').first().children('a').attr('href');
        return {
            name: values[0],
            licenseNumber: values[1],
            profession: values[2],
            licenseType: values[3],
            licenseStatus: values[4],
            city: values[5],
            state: values[6],
            link,
        };
    }).get();
    return { items, numPages };
};

const getViewStateFromPage = (webPage) => {
    const $ = cheerio.load(webPage);
    const __VIEWSTATE = $(`input[name=__VIEWSTATE]`).val();
    const __VIEWSTATEGENERATOR = $(`input[name=__VIEWSTATEGENERATOR]`).val();
    return { __VIEWSTATE, __VIEWSTATEGENERATOR };
};

const getSearchWebpage = async () => {
    const response = await mylicenseClient.get('/everification/Search.aspx');
    return response.data;
};

const getSearchCookies = async () => {
    const response = await mylicenseClient.get('/everification/Search.aspx');
    const cookies = setCookie.parse(response.headers['set-cookie']);
    return _.reduce(cookies, (result, cookie) => {
        return result + `${cookie.name}=${cookie.value}; `;
    }, "");
};

const postRequest = async (url, data, Cookie) => {
    const postData = querystring.stringify(data);
    return mylicenseClient.post(url, postData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
            Cookie,
        },
    });
};

const executeSearchAndGetSearchPage = async ({
    profession,
    licenseType,
    firstOrMidName,
    lastName,
    licenseNumber,
    status,
    county,
    city,
    state,
    zipcode,
    Cookie,
}) => {
    const response = await postRequest('/everification/Search.aspx', {
        "__EVENTTARGET": "",
        "__EVENTARGUMENT": "",
        "t_web_lookup__profession_name": profession,
        "t_web_lookup__license_type_name": licenseType,
        "t_web_lookup__first_name": firstOrMidName,
        "t_web_lookup__last_name": lastName,
        "t_web_lookup__license_no": licenseNumber,
        "t_web_lookup__license_status_name": status,
        "t_web_lookup__addr_county": county,
        "t_web_lookup__addr_city": city,
        "t_web_lookup__addr_state": state,
        "t_web_lookup__addr_zipcode": zipcode,
        "sch_button": "Search",
    }, Cookie);
    if (!response.request || !response.request.path || response.request.path !== '/everification/SearchResults.aspx') {
        throw new Error("Failure to fetch search results for the given query");
    }
    return response.data;
};

const getSearchResults = async ({
    __VIEWSTATE,
    __VIEWSTATEGENERATOR,
    pageNumber,
    Cookie,
}) => {
    const response = await postRequest('/everification/SearchResults.aspx', {
        "CurrentPageIndex": 1,
        "__EVENTTARGET": `datagrid_results:_ctl44:_ctl${pageNumber - 1}`,
        "__EVENTARGUMENT": "",
        __VIEWSTATE,
        __VIEWSTATEGENERATOR,
    }, Cookie);
    const { items, numPages } = getSearchResultsFromPage(response.data);
    if (pageNumber > numPages) {
        return { items: [], numPages };
    }
    return { items, numPages };
};

class MylicenseGateway {

    @Loggable
    async getAvailableProfessions() {
        return getSelectOptionsFromPage(await getSearchWebpage(), 't_web_lookup__profession_name');
    }

    @Loggable
    async getAvailableLicenseTypes() {
        return getSelectOptionsFromPage(await getSearchWebpage(), 't_web_lookup__license_type_name');
    }

    @Loggable
    async getAvailableStatuses() {
        return getSelectOptionsFromPage(await getSearchWebpage(), 't_web_lookup__license_status_name');
    }

    @Loggable
    async getStates() {
        return getSelectOptionsFromPage(await getSearchWebpage(), 't_web_lookup__addr_state');
    }

    @Loggable
    async search({
        profession = "",
        licenseType = "",
        firstOrMidName = "",
        lastName = "",
        licenseNumber = "",
        status = "",
        county = "",
        city = "",
        state = "",
        zipcode = "",
        pageNumber = 1,
    }) {
        const Cookie = await getSearchCookies();
        const webPage = await executeSearchAndGetSearchPage({
            profession,
            licenseType,
            firstOrMidName,
            lastName,
            licenseNumber,
            status,
            county,
            city,
            state,
            zipcode,
            Cookie,
        });
        const { items, numPages } = await getSearchResults({
            ...getViewStateFromPage(webPage),
            pageNumber,
            Cookie,
        });
        return { items, pageNumber, numPages };
    }
}

module.exports = new MylicenseGateway();
