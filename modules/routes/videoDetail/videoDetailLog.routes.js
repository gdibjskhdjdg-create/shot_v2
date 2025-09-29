const AsyncHandler = require("../../../helper/asyncHandler.tool");

const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");
const VideoDetailLogController = require("../../controllers/videoDetail/VideoDetailLog.controller");

/* ------------------------------ prefix: /api/videoDetail/log ------------------------------ */
async function videoDetailLogRoutes(fastify, opts) {

    fastify.addHook('preHandler', OnlyLoginUserMiddleware());
    fastify.get("/:videoFileId", AsyncHandler(VideoDetailLogController.getList));
    fastify.post("/:videoFileId", AsyncHandler(VideoDetailLogController.create));
}

module.exports = videoDetailLogRoutes;