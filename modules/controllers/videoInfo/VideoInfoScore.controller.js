const ResponseDTO = require("../../_default/Response.dto");
const VideoInfoScoreResponse = require("../../dto/videoInfo/VideoInfoScore.response");

const { VideoInfoScoreService } = require("../../services/videoInfo/index");
const videoInfoScoreValidation = require("../../validation/videoInfo/videoInfoScore.validation");

const fetchListBySection = async (req, res) => {
    const list = await VideoInfoScoreService.getItemsOfScore(req.user)
    return ResponseDTO.success(res, list)
}

const fetchAllItems = async (req, res) => {
    const { videoFileId } = req.params
    const list = await VideoInfoScoreService.getAllList(req.user, videoFileId)
    return ResponseDTO.success(res, VideoInfoScoreResponse.create(list))
}

const save = async (req, res) => {
    const { videoFileId } = req.params
    const { isMain } = await VideoInfoScoreService.checkUserIsMainAndGetSectionKeys(req.user)
    const validation = await videoInfoScoreValidation.store(isMain, req.body)
    const { scores } = validation

    await VideoInfoScoreService.storeScore({ user: req.user, videoFileId, scores })
    return ResponseDTO.success(res)
}

module.exports = {
    fetchListBySection,
    fetchAllItems,
    save
};