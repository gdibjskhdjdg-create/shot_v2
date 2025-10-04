const LanguageResponse = require("../../dto//language/Language.response");
const LanguageService = require("../../services/language/Language.service");
const LanguageValidation = require("../../validation/language/Language.validation");
const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const SampleCRUD_Controller = require("../../_default/controller/SampleCRUD.controller");

class LanguageController extends SampleCRUD_Controller {
    constructor() {
        super({
            validation: LanguageValidation,
            service: LanguageService,
            Response: LanguageResponse
        })
    }

    async getList(req, res) {
        const query = getDataFromReqQuery(req);
        const list = await LanguageService.getList(query)
        return BaseController.ok(res, list)
    }

    async getShots(req, res) {
        const { id } = req.params
        const query = getDataFromReqQuery(req);
        const shots = await LanguageService.getShotsOfLanguage(id, query)
        return BaseController.ok(res, shots)
    }

    async detachShot(req, res) {
        const { id, shotId } = req.params
        await LanguageService.detachShotFromLanguage(id, shotId)
        return BaseController.ok(res)
    }
}

module.exports = new LanguageController()