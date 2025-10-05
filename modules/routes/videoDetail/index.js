const AsyncHandler = require("../../../helper/asyncHandler.tool");


const VideoDetailController = require("../../controllers/videoDetail/VideoDetail.controller");
const videoDetailLogRoute = require("./videoDetailLog.routes");
const videoDetailScoreRoute = require("./videoDetailScore.routes");
const OnlyAdminMiddleware = require("../../middleware/user/OnlyAdmin.middleware");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");
const VideoDetailValidInitStatusMiddleware = require("../../middleware/videoDetail/VideoDetailValidInitStatus.middleware");
const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");
const AccessToVideoDetailMiddleware = require("../../middleware/videoDetail/AccessToVideoDetail.middleware");

/* ------------------------------ prefix: /api/videoDetail ------------------------------ */
async function videoDetailRoutes(fastify, opts) {

    fastify.get("/specialSearch/with-link/:uuid", AsyncHandler(VideoDetailController.fetchVideoListWithCode))
    fastify.get("/withUUID/:videoFileId/:uuid", AsyncHandler(VideoDetailController.fetchDetailWithUUID));

    fastify.register(async (fastifyProtected, opts) => {

        fastifyProtected.addHook('preHandler', OnlyLoginUserMiddleware());
        fastifyProtected.register(videoDetailLogRoute, { prefix: "/log" });
        fastifyProtected.register(videoDetailScoreRoute, { prefix: "/score" });
        fastifyProtected.get("/exportInfo", AsyncHandler(VideoDetailController.fetchExportInfoVideos));

        fastifyProtected.get("/aiTags",
            // CheckUserHaveValidAccessMiddleware(["videos-full-access"]),
            AsyncHandler(VideoDetailController.fetchAiTagsReport)

        )
        fastifyProtected.get("/aiTags/total",
            // CheckUserHaveValidAccessMiddleware(["videos-full-access"]),
            AsyncHandler(VideoDetailController.fetchAiTagsTotalReport)
        )

        fastifyProtected.get("/aiTags/:videoFileId",
            // CheckUserHaveValidAccessMiddleware(["videos-full-access"]),
            AsyncHandler(VideoDetailController.fetchAiTagsDetail)
        )

        fastifyProtected.post("/specialSearch/generate-link", { preHandler: OnlyAdminMiddleware }, AsyncHandler(VideoDetailController.createListLink))

        fastifyProtected.get("/specialSearch", { preHandler: CheckUserHaveValidAccessMiddleware(["video-list", "videos-full-access", "source-full-access"]) }, AsyncHandler(VideoDetailController.fetchVideoDetailSpecial));
        fastifyProtected.get("/specialSearch/getVideoDetailsId", { preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access", "source-full-access"]) }, AsyncHandler(VideoDetailController.fetchExportVideoDetailIds));
        fastifyProtected.get("/specialSearch/export/:exportType", { preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access", "source-full-access"]) }, AsyncHandler(VideoDetailController.exportSpecialVideoDetail));
        fastifyProtected.get("/export/:exportType", { preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access", "source-full-access"]) }, AsyncHandler(VideoDetailController.exportVideoDetailData));
        fastifyProtected.get("/export/path/:exportType", { preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access", "source-full-access"]) }, AsyncHandler(VideoDetailController.exportVideoDetailPath));
        fastifyProtected.get("/export/:exportType/:videoDetailId", { preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access", "source-full-access"]) }, AsyncHandler(VideoDetailController.exportToExcel));

        fastifyProtected.get("/list/cleaning/:status", { preHandler: CheckUserHaveValidAccessMiddleware(["video-list", "video-cleaning"]) }, AsyncHandler(VideoDetailController.fetchList));
        fastifyProtected.get("/list/all", { preHandler: CheckUserHaveValidAccessMiddleware(["video-list"]) }, AsyncHandler(VideoDetailController.fetchAllList));
        fastifyProtected.get("/list/:status", { preHandler: CheckUserHaveValidAccessMiddleware([]) }, AsyncHandler(VideoDetailController.fetchList));

        fastifyProtected.get("/:videoFileId", { preHandler: CheckUserHaveValidAccessMiddleware(["video-list", "video-cleaning", "videos-full-access", "video-init", 'video-score']) }, AsyncHandler(VideoDetailController.fetchDetail));
        fastifyProtected.get("/videoFile/:videoFileId", { preHandler: CheckUserHaveValidAccessMiddleware(["video-list"]) }, AsyncHandler(VideoDetailController.fetchVideoDetailsOfVideoFile));

        fastifyProtected.post("/uploadExcel", { preHandler: CheckUserHaveValidAccessMiddleware(['video-import-excel', 'shot-full-access']) }, AsyncHandler(VideoDetailController.importFromExcel));
        fastifyProtected.delete('/deleteByExcel', { preHandler: CheckUserHaveValidAccessMiddleware(['video-import-excel', "videos-full-access"]) }, AsyncHandler(VideoDetailController.importRemovalFromExcel));

        fastifyProtected.patch("/init/:videoFileId", {
            preHandler: [
                CheckUserHaveValidAccessMiddleware(["video-edit", "video-init", "videos-full-access", "video-cleaning"]),
                AccessToVideoDetailMiddleware,
                VideoDetailValidInitStatusMiddleware]
        },
            AsyncHandler(VideoDetailController.modifyInitVideoDetail)
        );
        fastifyProtected.patch("/edit/:videoFileId", {
            preHandler: [
                CheckUserHaveValidAccessMiddleware(["video-edit", "videos-full-access", "video-cleaning"]),
                AccessToVideoDetailMiddleware
            ]
        },
            AsyncHandler(VideoDetailController.modifyVideoDetail)
        );
        fastifyProtected.patch("/cleaning/:videoFileId", {
            preHandler:
                CheckUserHaveValidAccessMiddleware(["video-cleaning"])
        },
            AsyncHandler(VideoDetailController.modifyCleaningVideoDetail)
        );

        fastifyProtected.patch("/changeStatus", {
            preHandler:
                OnlyAdminMiddleware
        },
            AsyncHandler(VideoDetailController.modifyVideoDetailStatus)
        );

        fastifyProtected.patch("/group/setScore", {
            preHandler:
                // OnlyAdminMiddleware,
                CheckUserHaveValidAccessMiddleware(['video-score'])
        },
            AsyncHandler(VideoDetailController.modifyVideoDetailScores)
        );
    })
}

module.exports = videoDetailRoutes;