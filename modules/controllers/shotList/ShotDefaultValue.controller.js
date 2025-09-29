const SampleCRUD_Controller = require("../../_default/controller/SampleCRUD.controller");
const ShotDefaultValue_DTO = require("../../dto/shotList/ShotDefaultValue.dto");
const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const ShotDefaultValueValidation = require("../../validation/shotList/ShotDefaultValue.validation");
const ShotDefaultValueService = require("../../services/shotList/ShotDefaultValue.service");

class ShotDefaultValueController extends SampleCRUD_Controller {
    constructor() {
        super({
            validation: ShotDefaultValueValidation,
            service: ShotDefaultValueService,
            DTO: ShotDefaultValue_DTO
        })
    }

    async getList(req, res) {
        const { section } = req.params

        const query = getDataFromReqQuery(req);

        const list = await ShotDefaultValueService.getList(section, query)
        return BaseController.ok(res, list)
    }

    async getShots(req, res) {
        const { section, id } = req.params
        const query = getDataFromReqQuery(req);
        const shots = await ShotDefaultValueService.getShotsOfValue(section, id, query)
        return BaseController.ok(res, shots)
    }

    async detachShot(req, res) {
        const { section, shotId } = req.params
        await ShotDefaultValueService.detachShotFromValue(section, shotId)
        return BaseController.ok(res)

    }
}

module.exports = new ShotDefaultValueController();