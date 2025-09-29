const AsyncHandler = require("../../../helper/asyncHandler.tool");
const ErrorResult = require("../../../helper/error.tool");
const { videoDetailService } = require("../../services/videoDetail");

module.exports = AsyncHandler(async (req, res, next) => {
    const user = req.user;
    const { videoFileId } = req.params;

    if (user.permission === "admin"
        || user.access.includes("videos-full-access")
        || user.access.includes("source-full-access")
    ) {
        // return next()
        return
    }

    const access = await videoDetailService.checkAccessToVideo(videoFileId, user.id);
    if (access) {
        // return next()
        return
    }

    throw ErrorResult.forbidden("شما درسترسی به این ویدیو ندارید");
})