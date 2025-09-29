const BaseController = require("../../_default/controller/Base.controller");
const VideoDetailScore_DTO = require("../../dto/videoDetail/VideoDetailScore.dto");

const { videoDetailScoreService } = require("../../services/videoDetail/index");
const videoDetailScoreValidation = require("../../validation/videoDetail/videoDetailScore.validation");


class VideoDetailScoreController {
    async listBySection(req, res) {
        const list = await videoDetailScoreService.getItemsOfScore(req.user)
        return BaseController.ok(res, list)
    }

    async fetchItems(req, res) {
        const { videoFileId } = req.params
        const list = await videoDetailScoreService.getAllList(req.user, videoFileId)
        return BaseController.ok(res, VideoDetailScore_DTO.create(list))
    }

    async store(req, res) {
        const { videoFileId } = req.params
        const { isMain } = await videoDetailScoreService.checkUserIsMainAndGetSectionKeys(req.user)
        const validation = await videoDetailScoreValidation.store(isMain, req.body)
        const { scores } = validation

        await videoDetailScoreService.storeScore({ user: req.user, videoFileId, scores })
        return BaseController.ok(res)
    }


}

module.exports = new VideoDetailScoreController();