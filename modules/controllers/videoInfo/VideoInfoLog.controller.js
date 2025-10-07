const ResponseDTO = require("../../_default/Response.dto");

const { VideoInfoLogService } = require("../../services/videoInfo/index")

const fetchList = async (req, res) => {
    const { videoFileId } = req.params
    const files = await VideoInfoLogService.getLogList(videoFileId, req.query)
    return ResponseDTO.success(res, files)
}

const add = async (req, res) => {
    const { videoFileId } = req.params
    await VideoInfoLogService.createLog({ videoFileId, userId, body: req.body })
    return ResponseDTO.success(res)
}

module.exports = {
    fetchList,
    add
}

