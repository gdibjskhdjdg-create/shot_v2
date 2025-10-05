const ErrorBoundary = require("../../../helper/errorBoundary.tool");

const VideoDetailScoreController = require("../../controllers/videoDetail/VideoDetailScore.controller");

/* ------------------------------ prefix: /api/videoDetail/score ------------------------------ */
async function videoScoreLogRoutes(fastify, opts) {

    // router.use(OnlyLoginUserMiddleware())

    // fastify.addHook('preHandler', [OnlyLoginUserMiddleware(), heckUserHaveValidAccessMiddleware(['shot-main-score', 'shot-list-score', 'shot-equalize-score', 'shot-editing-score']]);

    fastify.get("/", ErrorBoundary(VideoDetailScoreController.fetchListBySection))
    fastify.get("/:videoFileId", ErrorBoundary(VideoDetailScoreController.fetchAllItems));
    fastify.post("/:videoFileId", ErrorBoundary(VideoDetailScoreController.save));

}

module.exports = videoScoreLogRoutes;