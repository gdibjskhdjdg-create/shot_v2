const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const ShotScoreResponse = require("../../dto/shotList/ShotScore.response");
const { shotScoreService } = require("../../services/shotList/index");
const shotScoreValidation = require("../../validation/shotList/shotScore.validation");

async function listBySection(req, res) {
    const list = await shotScoreService.getItemsOfScore(req.user)
    return BaseController.ok(res, list)
}

async function fetchItems(req, res) {
    const { shotId } = req.params
    const list = await shotScoreService.getAllList(req.user, shotId)
    return BaseController.ok(res, ShotScoreResponse.create(list))
}

async function store(req, res) {
    const { shotId } = req.params
    const { isMain } = await shotScoreService.checkUserIsMainAndGetSectionKeys(req.user)
    const validation = await shotScoreValidation.store(isMain, req.body)
    const { scores } = validation

    await shotScoreService.storeScore({ user: req.user, shotId, scores })
    return BaseController.ok(res)
}



module.exports = {
    listBySection,
    fetchItems,
    store
};