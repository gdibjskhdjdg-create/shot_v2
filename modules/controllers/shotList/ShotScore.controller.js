const ResponseDTO = require("../../_default/Response.dto");
const ShotScoreResponse = require("../../dto/shotList/ShotScore.response");
const { shotScoreService } = require("../../services/shotList/index");
const shotScoreValidation = require("../../validation/shotList/shotScore.validation");

async function fetchListBySection(req, res) {
    const list = await shotScoreService.getItemsOfScore(req.user)
    return ResponseDTO.success(res, list)
}

async function fetchAllItems(req, res) {
    const { shotId } = req.params
    const list = await shotScoreService.getAllList(req.user, shotId)
    return ResponseDTO.success(res, ShotScoreResponse.create(list))
}

async function save(req, res) {
    const { shotId } = req.params
    const { isMain } = await shotScoreService.checkUserIsMainAndGetSectionKeys(req.user)
    const validation = await shotScoreValidation.store(isMain, req.body)
    const { scores } = validation

    await shotScoreService.storeScore({ user: req.user, shotId, scores })
    return ResponseDTO.success(res)
}



module.exports = {
    fetchListBySection,
    fetchAllItems,
    save
};