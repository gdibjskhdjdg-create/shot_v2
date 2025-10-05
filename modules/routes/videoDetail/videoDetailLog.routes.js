const AsyncHandler = require("../../../helper/asyncHandler.tool");

const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");
const VideoDetailLogController = require("../../controllers/videoDetail/VideoDetailLog.controller");

/* ------------------------------ prefix: /api/videoDetail/log ------------------------------ */
async function videoDetailLogRoutes(fastify, opts) {

    fastify.addHook('preHandler', OnlyLoginUserMiddleware());
    fastify.get("/:videoFileId", AsyncHandler(VideoDetailLogController.fetchList));
    fastify.post("/:videoFileId", AsyncHandler(VideoDetailLogController.add));
}

module.exports = videoDetailLogRoutes;