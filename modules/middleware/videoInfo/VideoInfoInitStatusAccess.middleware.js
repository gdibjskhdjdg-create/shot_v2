const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const ErrorResult = require("../../../helper/error.tool");
const { VideoInfoService } = require("../../services/videoInfo");

module.exports = ErrorBoundary(async (req, res, next) => {
    const { videoFileId } = req.params;
    const access = await VideoInfoService.checkCanUpdateInit(videoFileId);
    if (access) {
        // return next()
        return
    }

    throw ErrorResult.forbidden("ویدیو غیرقابل ویرایش می باشد");
})