const ErrorBoundary = require("../../../helper/errorBoundary.tool");

const LoginRequiredMiddleware = require("../../middleware/user/LoginRequired.middleware");
const VideoInfoLogController = require("../../controllers/videoInfo/VideoInfoLog.controller");

/* ------------------------------ prefix: /api/videoDetail/log ------------------------------ */
async function videoInfoLogRoutes(fastify, opts) {

    fastify.addHook('preHandler', LoginRequiredMiddleware());
    fastify.get("/:videoFileId", ErrorBoundary(VideoInfoLogController.fetchList));
    fastify.post("/:videoFileId", ErrorBoundary(VideoInfoLogController.add));
}

module.exports = videoInfoLogRoutes;