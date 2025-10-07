const ErrorBoundary = require("../../../helper/errorBoundary.tool");

const VideoInfoScoreController = require("../../controllers/videoInfo/VideoInfoScore.controller");

/* ------------------------------ prefix: /api/videoDetail/score ------------------------------ */
async function videoInfoScoreLogRoutes(fastify, opts) {

    // router.use(OnlyLoginUserMiddleware())

    // fastify.addHook('preHandler', [OnlyLoginUserMiddleware(), heckUserHaveValidAccessMiddleware(['shot-main-score', 'shot-list-score', 'shot-equalize-score', 'shot-editing-score']]);

    fastify.get("/", ErrorBoundary(VideoInfoScoreController.fetchListBySection))
    fastify.get("/:videoFileId", ErrorBoundary(VideoInfoScoreController.fetchAllItems));
    fastify.post("/:videoFileId", ErrorBoundary(VideoInfoScoreController.save));

}

module.exports = videoInfoScoreLogRoutes;