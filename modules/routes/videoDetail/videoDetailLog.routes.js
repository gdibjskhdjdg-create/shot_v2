const ErrorBoundary = require("../../../helper/errorBoundary.tool");

const LoginRequiredMiddleware = require("../../middleware/user/LoginRequired.middleware");
const VideoDetailLogController = require("../../controllers/videoDetail/VideoDetailLog.controller");

/* ------------------------------ prefix: /api/videoDetail/log ------------------------------ */
async function videoDetailLogRoutes(fastify, opts) {

    fastify.addHook('preHandler', LoginRequiredMiddleware());
    fastify.get("/:videoFileId", ErrorBoundary(VideoDetailLogController.fetchList));
    fastify.post("/:videoFileId", ErrorBoundary(VideoDetailLogController.add));
}

module.exports = videoDetailLogRoutes;