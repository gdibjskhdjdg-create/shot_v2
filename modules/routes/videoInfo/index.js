const ErrorBoundary = require("../../../helper/errorBoundary.tool");


const VideoInfoController = require("../../controllers/videoInfo/VideoInfo.controller");
const videoInfoLogRoute = require("./videoInfoLog.routes");
const videoInfoScoreRoute = require("./videoInfoScore.routes");
const StrictlyAdminMiddleware = require("../../middleware/user/StrictlyAdmin.middleware");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");
const LoginRequiredMiddleware = require("../../middleware/user/LoginRequired.middleware");
const VideoInfoInitStatusAccessMiddleware = require("../../middleware/videoInfo/VideoInfoInitStatusAccess.middleware");
const VideoInfoAccessMiddleware = require("../../middleware/videoInfo/VideoInfoAccess.middleware");

/* ------------------------------ prefix: /api/videoDetail ------------------------------ */
async function videoDetailRoutes(fastify, opts) {

    fastify.get("/specialSearch/with-link/:uuid", ErrorBoundary(VideoInfoController.fetchVideoListWithCode))
    fastify.get("/withUUID/:videoFileId/:uuid", ErrorBoundary(VideoInfoController.fetchDetailWithUUID));

    fastify.register(async (fastifyProtected, opts) => {

        fastifyProtected.addHook('preHandler', LoginRequiredMiddleware());
        fastifyProtected.register(videoInfoLogRoute, { prefix: "/log" });
        fastifyProtected.register(videoInfoScoreRoute, { prefix: "/score" });
        fastifyProtected.get("/exportInfo", ErrorBoundary(VideoInfoController.fetchExportInfoVideos));

        fastifyProtected.get("/aiTags",
            // AuthorizationMiddleware(["videos-full-access"]),
            ErrorBoundary(VideoInfoController.fetchAiKeywordsReport)

        )
        fastifyProtected.get("/aiTags/total",
            // AuthorizationMiddleware(["videos-full-access"]),
            ErrorBoundary(VideoInfoController.fetchAiKeywordsTotalReport)
        )

        fastifyProtected.get("/aiTags/:videoFileId",
            // AuthorizationMiddleware(["videos-full-access"]),
            ErrorBoundary(VideoInfoController.fetchAiKeywordsDetail)
        )

        fastifyProtected.post("/specialSearch/generate-link", { preHandler: StrictlyAdminMiddleware }, ErrorBoundary(VideoInfoController.createListLink))

        fastifyProtected.get("/specialSearch", { preHandler: AuthorizationMiddleware(["video-list", "videos-full-access", "source-full-access"]) }, ErrorBoundary(VideoInfoController.fetchSpecial));
        fastifyProtected.get("/specialSearch/getVideoDetailsId", { preHandler: AuthorizationMiddleware(["videos-full-access", "source-full-access"]) }, ErrorBoundary(VideoInfoController.fetchExportByIds));
        fastifyProtected.get("/specialSearch/export/:exportType", { preHandler: AuthorizationMiddleware(["videos-full-access", "source-full-access"]) }, ErrorBoundary(VideoInfoController.exportSpecial));
        fastifyProtected.get("/export/:exportType", { preHandler: AuthorizationMiddleware(["videos-full-access", "source-full-access"]) }, ErrorBoundary(VideoInfoController.exportData));
        fastifyProtected.get("/export/path/:exportType", { preHandler: AuthorizationMiddleware(["videos-full-access", "source-full-access"]) }, ErrorBoundary(VideoInfoController.exportPath));
        fastifyProtected.get("/export/:exportType/:videoDetailId", { preHandler: AuthorizationMiddleware(["videos-full-access", "source-full-access"]) }, ErrorBoundary(VideoInfoController.exportToExcel));

        fastifyProtected.get("/list/cleaning/:status", { preHandler: AuthorizationMiddleware(["video-list", "video-cleaning"]) }, ErrorBoundary(VideoInfoController.fetchList));
        fastifyProtected.get("/list/all", { preHandler: AuthorizationMiddleware(["video-list"]) }, ErrorBoundary(VideoInfoController.fetchAllList));
        fastifyProtected.get("/list/:status", { preHandler: AuthorizationMiddleware([]) }, ErrorBoundary(VideoInfoController.fetchList));

        fastifyProtected.get("/:videoFileId", { preHandler: AuthorizationMiddleware(["video-list", "video-cleaning", "videos-full-access", "video-init", 'video-score']) }, ErrorBoundary(VideoInfoController.fetchDetail));
        fastifyProtected.get("/videoFile/:videoFileId", { preHandler: AuthorizationMiddleware(["video-list"]) }, ErrorBoundary(VideoInfoController.fetchVideoInfosOfVideoFile));

        fastifyProtected.post("/uploadExcel", { preHandler: AuthorizationMiddleware(['video-import-excel', 'shot-full-access']) }, ErrorBoundary(VideoInfoController.importFromExcel));
        fastifyProtected.delete('/deleteByExcel', { preHandler: AuthorizationMiddleware(['video-import-excel', "videos-full-access"]) }, ErrorBoundary(VideoInfoController.importRemovalFromExcel));

        fastifyProtected.patch("/init/:videoFileId", {
            preHandler: [
                AuthorizationMiddleware(["video-edit", "video-init", "videos-full-access", "video-cleaning"]),
                VideoInfoAccessMiddleware,
                VideoInfoInitStatusAccessMiddleware]
        },
            ErrorBoundary(VideoInfoController.modifyInit)
        );
        fastifyProtected.patch("/edit/:videoFileId", {
            preHandler: [
                AuthorizationMiddleware(["video-edit", "videos-full-access", "video-cleaning"]),
                VideoInfoAccessMiddleware
            ]
        },
            ErrorBoundary(VideoInfoController.modify)
        );
        fastifyProtected.patch("/cleaning/:videoFileId", {
            preHandler:
                AuthorizationMiddleware(["video-cleaning"])
        },
            ErrorBoundary(VideoInfoController.modifyCleaning)
        );

        fastifyProtected.patch("/changeStatus", {
            preHandler:
            StrictlyAdminMiddleware
        },
            ErrorBoundary(VideoInfoController.modifyStatus)
        );

        fastifyProtected.patch("/group/setScore", {
            preHandler:
                // StrictlyAdminMiddleware,
                AuthorizationMiddleware(['video-score'])
        },
            ErrorBoundary(VideoInfoController.modifyScores)
        );
    })
}

module.exports = videoDetailRoutes;