const AsyncHandler = require("../../../helper/asyncHandler.tool");

// const OnlyAdminMiddleware = require("../../user/middleware/OnlyAdmin.middleware");
// const CheckUserHaveValidAccessMiddleware = require("../../user/middleware/CheckUserHaveValidAccess.middleware");
const OnlyLoginUserMiddleware = require("../../user/middleware/OnlyLoginUser.middleware");
const VideoDetailLogController = require("../controller/VideoDetailLog.controller");

/* ------------------------------ prefix: /api/videoDetail/log ------------------------------ */
async function videoDetailLogRoutes(fastify, opts) {

    fastify.addHook('preHandler', OnlyLoginUserMiddleware());
    fastify.get("/:videoFileId", AsyncHandler(VideoDetailLogController.getList));
    fastify.post("/:videoFileId", AsyncHandler(VideoDetailLogController.create));
}

module.exports = videoDetailLogRoutes;