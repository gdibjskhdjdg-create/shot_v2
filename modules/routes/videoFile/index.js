const AsyncHandler = require("../../../helper/asyncHandler.tool");

const VideoFileController = require("../../controllers/videoFile/VideoFile.controller");

const exportVideoFile = require("./export.routes")
const templateVideoFile = require("./template.routes");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");
const VideoDetailController = require("../../controllers/videoDetail/VideoDetail.controller");
const OnlyAdminMiddleware = require("../../middleware/user/OnlyAdmin.middleware");


async function videoFileRoutes(fastify, opts) {

    fastify.register(exportVideoFile, { prefix: "/export" });
    fastify.register(templateVideoFile, { prefix: "/template" });

    /* ------------------------------ prefix: /api/videoFile ------------------------------ */
    fastify.get("/", {
        preHandler: CheckUserHaveValidAccessMiddleware([])
    }, AsyncHandler(VideoFileController.fetchVideoFileList));

    fastify.patch("/:videoFileId", {
        preHandler: OnlyAdminMiddleware
    }, AsyncHandler(VideoFileController.modifyFileInfo));

    // sources list routes
    fastify.get("/canBeShot", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access'])
    }, AsyncHandler(VideoFileController.fetchVideoFileListCanBeShot));

    fastify.get("/canBeShot/init-check", {
        preHandler: CheckUserHaveValidAccessMiddleware([])
    }, AsyncHandler(VideoFileController.fetchInitCheckVideoFileListCanBeShot));

    fastify.get("/canBeShot/editor", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-editor'])
    }, AsyncHandler(VideoFileController.fetchEditorCheckVideoFileListCanBeShot));
    fastify.get("/canBeShot/equalizing", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-equalize'])
    }, AsyncHandler(VideoFileController.fetchEqualizingCheckVideoFileListCanBeShot));
    fastify.get("/canBeShot/equalized", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-equalize'])
    }, AsyncHandler(VideoFileController.fetchEqualizedCheckVideoFileListCanBeShot));
    // ========================

    // sources detail list routes
    fastify.get("/detail/:videoFileId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access'])
    }, AsyncHandler(VideoFileController.fetchVideoFileDetail));
    fastify.get("/detail/:videoFileId/init-check", {
        preHandler: CheckUserHaveValidAccessMiddleware([])
    }, AsyncHandler(VideoFileController.fetchInitVideoFileDetail));
    fastify.get("/detail/:videoFileId/editor", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-editor'])
    }, AsyncHandler(VideoFileController.fetchEditorVideoFileDetail));
    fastify.get("/detail/:videoFileId/equalizing", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-equalize'])
    }, AsyncHandler(VideoFileController.fetchEqualizingVideoFileDetail));

    // =========================

    // specProject routes
    // fastify.post("/specProject/:projectId", CheckUserHaveValidAccessMiddleware([]), AsyncHandler(VideoFileController.getVideoFileOfPath));
    fastify.post("/specProject/init-check/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware([])
    }, AsyncHandler(VideoFileController.fetchInitCheckVideoFileOfPath));
    fastify.post("/specProject/editor/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-editor'])
    }, AsyncHandler(VideoFileController.fetchEditorVideoFileOfPath));
    fastify.post("/specProject/equalizing/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-equalize'])
    }, AsyncHandler(VideoFileController.fetchEqualizingVideoFileOfPath));
    fastify.post("/specProject/equalized/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-equalize'])
    }, AsyncHandler(VideoFileController.fetchEqualizedVideoFileOfPath));

    fastify.post("/specProject/init/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware([])
    }, AsyncHandler(VideoFileController.fetchInitVideoFileOfPath));
    fastify.post("/specProject/cleaning/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['video-cleaning'])
    }, AsyncHandler(VideoFileController.fetchCleaningVideoFileOfPath));
    fastify.post("/specProject/cleaned/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['video-cleaning'])
    }, AsyncHandler(VideoFileController.fetchCleanedVideoFileOfPath));
    // =========================

    fastify.get("/show/:videoFileId", AsyncHandler(VideoFileController.streamVideoFile));

    fastify.get("/log/:videoFileId", {
        preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access", "source-full-access"])
    }, AsyncHandler(VideoFileController.fetchVideoFileLog));

    fastify.post("/assigned/:videoFileId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['video-to-user', "videos-full-access"])
    }, AsyncHandler(VideoFileController.assignVideoToUserByQuery));
    fastify.put("/assigned/:videoFileId/:userId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['video-to-user', "videos-full-access"])
    }, AsyncHandler(VideoFileController.reassignVideoToUser));
    fastify.put("/assigned/project/:projectId/:userId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['video-to-user', "videos-full-access"])
    }, AsyncHandler(VideoFileController.reassignProjectVideosToUser));
    fastify.put("/assignedByPath/project/:projectId/:userId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['video-to-user', "videos-full-access"])
    }, AsyncHandler(VideoFileController.reassignVideosByPathToUser));

    /** set important to all videos of project */
    fastify.put("/important/project/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access"])
    }, AsyncHandler(VideoFileController.markImportantVideosOfProject));
    /** set owner to all videos of project */
    fastify.put('/detail/setOwner/:projectId', {
        preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access"])
    }, AsyncHandler(VideoDetailController.assignOwnerToProjectFiles));

    fastify.put("/important/:videoFileId", {
        preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access"])
    }, AsyncHandler(VideoFileController.markImportantEncodeVideo));

    fastify.post("/upload", {
        preHandler: CheckUserHaveValidAccessMiddleware(['video-upload', "videos-full-access"])
    }, AsyncHandler(VideoFileController.importVideoFile));
    fastify.post("/upload/:videoFileId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['video-upload', "videos-full-access"])
    }, AsyncHandler(VideoFileController.reimportVideoFile));

    fastify.delete("/:videoFileId", {
        preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access"])
    }, AsyncHandler(VideoFileController.removeVideoFile));
    fastify.delete("/mainFileProject/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware(["project-manage", "videos-full-access"])
    }, AsyncHandler(VideoFileController.removeVideoMainFile));

}
module.exports = videoFileRoutes;