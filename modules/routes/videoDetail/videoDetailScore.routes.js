const AsyncHandler = require("../../../helper/asyncHandler.tool");

const VideoDetailScoreController = require("../../controllers/videoDetail/VideoDetailScore.controller");

/* ------------------------------ prefix: /api/videoDetail/score ------------------------------ */
async function videoScoreLogRoutes(fastify, opts) {

    // router.use(OnlyLoginUserMiddleware())
    // router.use(CheckUserHaveValidAccessMiddleware(['shot-main-score', 'shot-list-score', 'shot-equalize-score', 'shot-editing-score']))

    // fastify.addHook('preHandler', [OnlyLoginUserMiddleware(), heckUserHaveValidAccessMiddleware(['shot-main-score', 'shot-list-score', 'shot-equalize-score', 'shot-editing-score']]);

    fastify.get("/", AsyncHandler(VideoDetailScoreController.fetchListBySection))
    fastify.get("/:videoFileId", AsyncHandler(VideoDetailScoreController.fetchAllItems));
    fastify.post("/:videoFileId", AsyncHandler(VideoDetailScoreController.save));

}

module.exports = videoScoreLogRoutes;