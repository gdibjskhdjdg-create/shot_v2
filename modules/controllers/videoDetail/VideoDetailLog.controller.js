const BaseController = require("../../_default/controller/Base.controller");

const { videoDetailLogService } = require("../../services/videoDetail/index")

const getList = async (req, res) => {
    const { videoFileId } = req.params
    const files = await videoDetailLogService.getVideoDetailLogList(videoFileId, req.query)
    return BaseController.ok(res, files)
}

const create = async (req, res) => {
    const { videoFileId } = req.params
    await videoDetailLogService.createVideoDetailLog({ videoFileId, userId, body: req.body })
    return BaseController.ok(res)
}

module.exports = {
    getList,
    create
}

