const ResponseDTO = require("../../_default/Response.dto");
const VideoDetailScoreResponse = require("../../dto/videoDetail/VideoDetailScore.response");

const { videoDetailScoreService } = require("../../services/videoDetail/index");
const videoDetailScoreValidation = require("../../validation/videoDetail/videoDetailScore.validation");

const listBySection = async (req, res) => {
    const list = await videoDetailScoreService.getItemsOfScore(req.user)
    return ResponseDTO.success(res, list)
}

const fetchItems = async (req, res) => {
    const { videoFileId } = req.params
    const list = await videoDetailScoreService.getAllList(req.user, videoFileId)
    return ResponseDTO.success(res, VideoDetailScoreResponse.create(list))
}

const store = async (req, res) => {
    const { videoFileId } = req.params
    const { isMain } = await videoDetailScoreService.checkUserIsMainAndGetSectionKeys(req.user)
    const validation = await videoDetailScoreValidation.store(isMain, req.body)
    const { scores } = validation

    await videoDetailScoreService.storeScore({ user: req.user, videoFileId, scores })
    return ResponseDTO.success(res)
}

module.exports = {
    listBySection,
    fetchItems,
    store
};