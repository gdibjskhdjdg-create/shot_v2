const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const ErrorResult = require("../../../helper/error.tool");
const { VideoInfoService } = require("../../services/videoInfo");

module.exports = ErrorBoundary(async (req, res, next) => {
    const user = req.user;
    const { videoFileId } = req.params;

    if (user.permission === "admin"
        || user.access.includes("videos-full-access")
        || user.access.includes("source-full-access")
    ) {
        // return next()
        return
    }

    const access = await VideoInfoService.checkAccessToVideo(videoFileId, user.id);
    if (access) {
        // return next()
        return
    }

    throw ErrorResult.forbidden("شما درسترسی به این ویدیو ندارید");
})