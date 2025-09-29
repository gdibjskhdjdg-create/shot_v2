const SampleCRUD_Service = require("../../_default/service/SampleCRUD.service");
const { ShotInput } = require("../../_default/model");

class ShotInputService extends SampleCRUD_Service {
    constructor(){
        super(ShotInput)
    }
}

module.exports = new ShotInputService();