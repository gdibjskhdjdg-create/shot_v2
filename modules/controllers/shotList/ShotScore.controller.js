const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const ShotScore_DTO = require("../../dto/shotList/ShotScore.dto");
const { shotScoreService } = require("../../services/shotList/index");
const shotScoreValidation = require("../../validation/shotList/shotScore.validation");

class ShotLogController {

    async listBySection(req, res) {
        const list = await shotScoreService.getItemsOfScore(req.user)
        return BaseController.ok(res, list)
    }

    async fetchItems(req, res) {
        const { shotId } = req.params
        const list = await shotScoreService.getAllList(req.user, shotId)
        return BaseController.ok(res, ShotScore_DTO.create(list))
    }

    async store(req, res) {
        const { shotId } = req.params
        const { isMain } = await shotScoreService.checkUserIsMainAndGetSectionKeys(req.user)
        const validation = await shotScoreValidation.store(isMain, req.body)
        const { scores } = validation

        await shotScoreService.storeScore({ user: req.user, shotId, scores })
        return BaseController.ok(res)
    }

}

module.exports = new ShotLogController();