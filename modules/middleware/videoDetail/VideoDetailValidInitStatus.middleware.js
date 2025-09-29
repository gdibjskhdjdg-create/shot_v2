const AsyncHandler = require("../../../helper/asyncHandler.tool");
const ErrorResult = require("../../../helper/error.tool");
const { videoDetailService } = require("../../services/videoDetail");

module.exports = AsyncHandler(async (req, res, next) => {
    const { videoFileId } = req.params;
    const access = await videoDetailService.checkCanUpdateInitVideoDetail(videoFileId);
    if (access) {
        // return next()
        return
    }

    throw ErrorResult.forbidden("ویدیو غیرقابل ویرایش می باشد");
})