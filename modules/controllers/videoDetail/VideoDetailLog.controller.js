const ResponseDTO = require("../../_default/Response.dto");

const { videoDetailLogService } = require("../../services/videoDetail/index")

const fetchList = async (req, res) => {
    const { videoFileId } = req.params
    const files = await videoDetailLogService.getVideoDetailLogList(videoFileId, req.query)
    return ResponseDTO.success(res, files)
}

const add = async (req, res) => {
    const { videoFileId } = req.params
    await videoDetailLogService.createVideoDetailLog({ videoFileId, userId, body: req.body })
    return ResponseDTO.success(res)
}

module.exports = {
    fetchList,
    add
}

