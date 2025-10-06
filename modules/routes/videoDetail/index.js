const ErrorBoundary = require("../../../helper/errorBoundary.tool");


const VideoDetailController = require("../../controllers/videoDetail/VideoDetail.controller");
const videoDetailLogRoute = require("./videoDetailLog.routes");
const videoDetailScoreRoute = require("./videoDetailScore.routes");
const StrictlyAdminMiddleware = require("../../middleware/user/StrictlyAdmin.middleware");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");
const VideoDetailInitStatusAccessMiddleware = require("../../middleware/videoDetail/VideoDetailInitStatusAccess.middleware");
const LoginRequiredMiddleware = require("../../middleware/user/LoginRequired.middleware");
const VideoDetailAccessMiddleware = require("../../middleware/videoDetail/VideoDetailAccess.middleware");

/* ------------------------------ prefix: /api/videoDetail ------------------------------ */
async function videoDetailRoutes(fastify, opts) {

    fastify.get("/specialSearch/with-link/:uuid", ErrorBoundary(VideoDetailController.fetchVideoListWithCode))
    fastify.get("/withUUID/:videoFileId/:uuid", ErrorBoundary(VideoDetailController.fetchDetailWithUUID));

    fastify.register(async (fastifyProtected, opts) => {

        fastifyProtected.addHook('preHandler', LoginRequiredMiddleware());
        fastifyProtected.register(videoDetailLogRoute, { prefix: "/log" });
        fastifyProtected.register(videoDetailScoreRoute, { prefix: "/score" });
        fastifyProtected.get("/exportInfo", ErrorBoundary(VideoDetailController.fetchExportInfoVideos));

        fastifyProtected.get("/aiTags",
            // AuthorizationMiddleware(["videos-full-access"]),
            ErrorBoundary(VideoDetailController.fetchAiKeywordsReport)

        )
        fastifyProtected.get("/aiTags/total",
            // AuthorizationMiddleware(["videos-full-access"]),
            ErrorBoundary(VideoDetailController.fetchAiKeywordsTotalReport)
        )

        fastifyProtected.get("/aiTags/:videoFileId",
            // AuthorizationMiddleware(["videos-full-access"]),
            ErrorBoundary(VideoDetailController.fetchAiKeywordsDetail)
        )

        fastifyProtected.post("/specialSearch/generate-link", { preHandler: StrictlyAdminMiddleware }, ErrorBoundary(VideoDetailController.createListLink))

        fastifyProtected.get("/specialSearch", { preHandler: AuthorizationMiddleware(["video-list", "videos-full-access", "source-full-access"]) }, ErrorBoundary(VideoDetailController.fetchVideoDetailSpecial));
        fastifyProtected.get("/specialSearch/getVideoDetailsId", { preHandler: AuthorizationMiddleware(["videos-full-access", "source-full-access"]) }, ErrorBoundary(VideoDetailController.fetchExportVideoDetailIds));
        fastifyProtected.get("/specialSearch/export/:exportType", { preHandler: AuthorizationMiddleware(["videos-full-access", "source-full-access"]) }, ErrorBoundary(VideoDetailController.exportSpecialVideoDetail));
        fastifyProtected.get("/export/:exportType", { preHandler: AuthorizationMiddleware(["videos-full-access", "source-full-access"]) }, ErrorBoundary(VideoDetailController.exportVideoDetailData));
        fastifyProtected.get("/export/path/:exportType", { preHandler: AuthorizationMiddleware(["videos-full-access", "source-full-access"]) }, ErrorBoundary(VideoDetailController.exportVideoDetailPath));
        fastifyProtected.get("/export/:exportType/:videoDetailId", { preHandler: AuthorizationMiddleware(["videos-full-access", "source-full-access"]) }, ErrorBoundary(VideoDetailController.exportToExcel));

        fastifyProtected.get("/list/cleaning/:status", { preHandler: AuthorizationMiddleware(["video-list", "video-cleaning"]) }, ErrorBoundary(VideoDetailController.fetchList));
        fastifyProtected.get("/list/all", { preHandler: AuthorizationMiddleware(["video-list"]) }, ErrorBoundary(VideoDetailController.fetchAllList));
        fastifyProtected.get("/list/:status", { preHandler: AuthorizationMiddleware([]) }, ErrorBoundary(VideoDetailController.fetchList));

        fastifyProtected.get("/:videoFileId", { preHandler: AuthorizationMiddleware(["video-list", "video-cleaning", "videos-full-access", "video-init", 'video-score']) }, ErrorBoundary(VideoDetailController.fetchDetail));
        fastifyProtected.get("/videoFile/:videoFileId", { preHandler: AuthorizationMiddleware(["video-list"]) }, ErrorBoundary(VideoDetailController.fetchVideoDetailsOfVideoFile));

        fastifyProtected.post("/uploadExcel", { preHandler: AuthorizationMiddleware(['video-import-excel', 'shot-full-access']) }, ErrorBoundary(VideoDetailController.importFromExcel));
        fastifyProtected.delete('/deleteByExcel', { preHandler: AuthorizationMiddleware(['video-import-excel', "videos-full-access"]) }, ErrorBoundary(VideoDetailController.importRemovalFromExcel));

        fastifyProtected.patch("/init/:videoFileId", {
            preHandler: [
                AuthorizationMiddleware(["video-edit", "video-init", "videos-full-access", "video-cleaning"]),
                VideoDetailAccessMiddleware,
                VideoDetailInitStatusAccessMiddleware]
        },
            ErrorBoundary(VideoDetailController.modifyInitVideoDetail)
        );
        fastifyProtected.patch("/edit/:videoFileId", {
            preHandler: [
                AuthorizationMiddleware(["video-edit", "videos-full-access", "video-cleaning"]),
                VideoDetailAccessMiddleware
            ]
        },
            ErrorBoundary(VideoDetailController.modifyVideoDetail)
        );
        fastifyProtected.patch("/cleaning/:videoFileId", {
            preHandler:
                AuthorizationMiddleware(["video-cleaning"])
        },
            ErrorBoundary(VideoDetailController.modifyCleaningVideoDetail)
        );

        fastifyProtected.patch("/changeStatus", {
            preHandler:
            StrictlyAdminMiddleware
        },
            ErrorBoundary(VideoDetailController.modifyVideoDetailStatus)
        );

        fastifyProtected.patch("/group/setScore", {
            preHandler:
                // StrictlyAdminMiddleware,
                AuthorizationMiddleware(['video-score'])
        },
            ErrorBoundary(VideoDetailController.modifyVideoDetailScores)
        );
    })
}

module.exports = videoDetailRoutes;