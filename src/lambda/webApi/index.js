const buildLambdaApi = require('../../builders/buildLambdaApi');
const { Loggable } = require('../../common/aspects');
const mylicenseService = require('../../services/mylicenseService');

class Router {

    @Loggable
    async getAvailableProfessions() {
        return mylicenseService.getAvailableProfessions();
    }

    @Loggable
    async getAvailableLicenseTypes() {
        return mylicenseService.getAvailableLicenseTypes();
    }

    @Loggable
    async getAvailableStatuses() {
        return mylicenseService.getAvailableStatuses();
    }

    @Loggable
    async getStates() {
        return mylicenseService.getStates();
    }

    @Loggable
    async search({
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
        pageNumber,
    }) {
        return mylicenseService.search({
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
            pageNumber,
        });
    }
}

module.exports = buildLambdaApi(new Router())
    .get('/mylicense/professions', (lambda, request) => lambda.getAvailableProfessions())
    .get('/mylicense/licenseTypes', (lambda, request) => lambda.getAvailableLicenseTypes())
    .get('/mylicense/statuses', (lambda, request) => lambda.getAvailableStatuses())
    .get('/mylicense/states', (lambda, request) => lambda.getStates())
    .post('/mylicense/search', (lambda, request) => lambda.search(request.body));
