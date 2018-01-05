const { Loggable } = require('../common/aspects');
const mylicenseGateway = require('../gateways/mylicenseGateway');

class MylicenseService {

    @Loggable
    async getAvailableProfessions() {
        return mylicenseGateway.getAvailableProfessions();
    }

    @Loggable
    async getAvailableLicenseTypes() {
        return mylicenseGateway.getAvailableLicenseTypes();
    }

    @Loggable
    async getAvailableStatuses() {
        return mylicenseGateway.getAvailableStatuses();
    }

    @Loggable
    async getStates() {
        return mylicenseGateway.getStates();
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
        return mylicenseGateway.search({
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

module.exports = new MylicenseService();
