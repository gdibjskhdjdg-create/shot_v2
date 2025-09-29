const AsyncHandler = require("../../../helper/asyncHandler.tool");

const OnlyLoginUserMiddleware = require("../../user/middleware/OnlyLoginUser.middleware");

const videoDetailLogRoute = require("./videoDetailLog.routes");
const videoDetailScoreRoute = require("./videoDetailScore.routes");
const OnlyAdminMiddleware = require("../../user/middleware/OnlyAdmin.middleware");
const CheckUserHaveValidAccessMiddleware = require("../../user/middleware/CheckUserHaveValidAccess.middleware");
const VideoDetailController = require("../controller/VideoDetail.controller");
const AccessToVideoDetailMiddleware = require("../middleware/AccessToVideoDetail.middleware");
const VideoDetailValidInitStatusMiddleware = require("../middleware/VideoDetailValidInitStatus.middleware");

/* ------------------------------ prefix: /api/videoDetail ------------------------------ */
async function videoDetailRoutes(fastify, opts) {

    fastify.get("/specialSearch/with-link/:uuid", AsyncHandler(VideoDetailController.getVideoListWithCode))
    fastify.get("/withUUID/:videoFileId/:uuid", AsyncHandler(VideoDetailController.getDetailWithUUID));

    fastify.register(async (fastifyProtected, opts) => {

        fastifyProtected.addHook('preHandler', OnlyLoginUserMiddleware());
        fastifyProtected.register(videoDetailLogRoute, { prefix: "/log" });
        fastifyProtected.register(videoDetailScoreRoute, { prefix: "/score" });
        fastifyProtected.get("/exportInfo", AsyncHandler(VideoDetailController.getExportInfoVideos));

        fastifyProtected.get("/aiTags",
            // CheckUserHaveValidAccessMiddleware(["videos-full-access"]),
            AsyncHandler(VideoDetailController.aiTagsReport)

        )
        fastifyProtected.get("/aiTags/total",
            // CheckUserHaveValidAccessMiddleware(["videos-full-access"]),
            AsyncHandler(VideoDetailController.aiTagsTotalReport)
        )

        fastifyProtected.get("/aiTags/:videoFileId",
            // CheckUserHaveValidAccessMiddleware(["videos-full-access"]),
            AsyncHandler(VideoDetailController.aiTagsDetail)
        )

        fastifyProtected.post("/specialSearch/generate-link", { preHandler: OnlyAdminMiddleware }, AsyncHandler(VideoDetailController.generateListLink))

        fastifyProtected.get("/specialSearch", { preHandler: CheckUserHaveValidAccessMiddleware(["video-list", "videos-full-access", "source-full-access"]) }, AsyncHandler(VideoDetailController.getVideoDetailSpecial));
        fastifyProtected.get("/specialSearch/getVideoDetailsId", { preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access", "source-full-access"]) }, AsyncHandler(VideoDetailController.getExportVideoDetailIds));
        fastifyProtected.get("/specialSearch/export/:exportType", { preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access", "source-full-access"]) }, AsyncHandler(VideoDetailController.exportVideoDetailSpecial));
        fastifyProtected.get("/export/:exportType", { preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access", "source-full-access"]) }, AsyncHandler(VideoDetailController.exportVideoDetails));
        fastifyProtected.get("/export/path/:exportType", { preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access", "source-full-access"]) }, AsyncHandler(VideoDetailController.exportVideoDetailsPath));
        fastifyProtected.get("/export/:exportType/:videoDetailId", { preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access", "source-full-access"]) }, AsyncHandler(VideoDetailController.exportExcel));

        fastifyProtected.get("/list/cleaning/:status", { preHandler: CheckUserHaveValidAccessMiddleware(["video-list", "video-cleaning"]) }, AsyncHandler(VideoDetailController.getList));
        fastifyProtected.get("/list/all", { preHandler: CheckUserHaveValidAccessMiddleware(["video-list"]) }, AsyncHandler(VideoDetailController.getAllList));
        fastifyProtected.get("/list/:status", { preHandler: CheckUserHaveValidAccessMiddleware([]) }, AsyncHandler(VideoDetailController.getList));

        fastifyProtected.get("/:videoFileId", { preHandler: CheckUserHaveValidAccessMiddleware(["video-list", "video-cleaning", "videos-full-access", "video-init", 'video-score']) }, AsyncHandler(VideoDetailController.getDetail));
        fastifyProtected.get("/videoFile/:videoFileId", { preHandler: CheckUserHaveValidAccessMiddleware(["video-list"]) }, AsyncHandler(VideoDetailController.getVideoDetailsOfVideoFile));

        fastifyProtected.post("/uploadExcel", { preHandler: CheckUserHaveValidAccessMiddleware(['video-import-excel', 'shot-full-access']) }, AsyncHandler(VideoDetailController.uploadExcel));
        fastifyProtected.delete('/deleteByExcel', { preHandler: CheckUserHaveValidAccessMiddleware(['video-import-excel', "videos-full-access"]) }, AsyncHandler(VideoDetailController.uploadRemovalExcel));

        fastifyProtected.patch("/init/:videoFileId", {
            preHandler: [
                CheckUserHaveValidAccessMiddleware(["video-edit", "video-init", "videos-full-access", "video-cleaning"]),
                AccessToVideoDetailMiddleware,
                VideoDetailValidInitStatusMiddleware]
        },
            AsyncHandler(VideoDetailController.updateInitVideoDetail)
        );
        fastifyProtected.patch("/edit/:videoFileId", {
            preHandler: [
                CheckUserHaveValidAccessMiddleware(["video-edit", "videos-full-access", "video-cleaning"]),
                AccessToVideoDetailMiddleware
            ]
        },
            AsyncHandler(VideoDetailController.updateVideoDetail)
        );
        fastifyProtected.patch("/cleaning/:videoFileId", {
            preHandler:
                CheckUserHaveValidAccessMiddleware(["video-cleaning"])
        },
            AsyncHandler(VideoDetailController.updateCleaningVideoDetail)
        );

        fastifyProtected.patch("/changeStatus", {
            preHandler:
                OnlyAdminMiddleware
        },
            AsyncHandler(VideoDetailController.updateVideoDetailStatus)
        );

        fastifyProtected.patch("/group/setScore", {
            preHandler:
                // OnlyAdminMiddleware,
                CheckUserHaveValidAccessMiddleware(['video-score'])
        },
            AsyncHandler(VideoDetailController.updateVideoDetailScores)
        );
    })
}

module.exports = videoDetailRoutes;