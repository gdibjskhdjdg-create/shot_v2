const SampleCRUD_Service = require("../../_default/service/SampleCRUD.service");
const { City } = require("../../_default/model");


class CityService extends SampleCRUD_Service {
    constructor(){
        super(City)
    }
}

module.exports = new CityService();