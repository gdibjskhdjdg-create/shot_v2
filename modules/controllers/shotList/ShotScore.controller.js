const BaseController = require("../../_default/controller/Base.controller");
const ShotScore_DTO = require("../../dto/shotList/ShotScore.dto");
const { shotScoreService } = require("../../services/shotList/index");
const shotScoreValidation = require("../../validation/shotList/shotScore.validation");

const listScoresBySection = async (req, res) => {
    const scoreItems = await shotScoreService.getItemsOfScore(req.user);
    return BaseController.ok(res, scoreItems);
};

const getShotScores = async (req, res) => {
    const { shotId } = req.params;
    const scoreList = await shotScoreService.getAllList(req.user, shotId);
    return BaseController.ok(res, ShotScore_DTO.create(scoreList));
};

const saveShotScores = async (req, res) => {
    const { shotId } = req.params;
    const { user, body } = req;
    const { isMain } = await shotScoreService.checkUserIsMainAndGetSectionKeys(user);
    const { scores } = await shotScoreValidation.store(isMain, body);

    await shotScoreService.storeScore({ user, shotId, scores });
    return BaseController.ok(res);
};

module.exports = {
    listScoresBySection,
    getShotScores,
    saveShotScores,
};
