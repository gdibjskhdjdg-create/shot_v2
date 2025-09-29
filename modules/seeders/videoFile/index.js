const AsyncHandler = require("../../../helper/asyncHandler.tool");

const VideoFileController = require("../controller/VideoFile.controller");

const exportVideoFile = require("./export.routes")
const templateVideoFile = require("./template.routes");
const CheckUserHaveValidAccessMiddleware = require("../../user/middleware/CheckUserHaveValidAccess.middleware");
const VideoDetailController = require("../../videoDetail/controller/VideoDetail.controller");
const OnlyAdminMiddleware = require("../../user/middleware/OnlyAdmin.middleware");


async function videoFileRoutes(fastify, opts) {

    fastify.register(exportVideoFile, { prefix: "/export" });
    fastify.register(templateVideoFile, { prefix: "/template" });

    /* ------------------------------ prefix: /api/videoFile ------------------------------ */
    fastify.get("/", {
        preHandler: CheckUserHaveValidAccessMiddleware([])
    }, AsyncHandler(VideoFileController.getVideoFileList));

    fastify.patch("/:videoFileId", {
        preHandler: OnlyAdminMiddleware
    }, AsyncHandler(VideoFileController.updateFileInfo));

    // sources list routes
    fastify.get("/canBeShot", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access'])
    }, AsyncHandler(VideoFileController.getVideoFileListCanBeShot));

    fastify.get("/canBeShot/init-check", {
        preHandler: CheckUserHaveValidAccessMiddleware([])
    }, AsyncHandler(VideoFileController.getInitCheckVideoFileListCanBeShot));

    fastify.get("/canBeShot/editor", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-editor'])
    }, AsyncHandler(VideoFileController.getEditorCheckVideoFileListCanBeShot));
    fastify.get("/canBeShot/equalizing", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-equalize'])
    }, AsyncHandler(VideoFileController.getEqualizingCheckVideoFileListCanBeShot));
    fastify.get("/canBeShot/equalized", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-equalize'])
    }, AsyncHandler(VideoFileController.getEqualizedCheckVideoFileListCanBeShot));
    // ========================

    // sources detail list routes
    fastify.get("/detail/:videoFileId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access'])
    }, AsyncHandler(VideoFileController.getVideoFileDetail));
    fastify.get("/detail/:videoFileId/init-check", {
        preHandler: CheckUserHaveValidAccessMiddleware([])
    }, AsyncHandler(VideoFileController.getInitVideoFileDetail));
    fastify.get("/detail/:videoFileId/editor", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-editor'])
    }, AsyncHandler(VideoFileController.getEditorVideoFileDetail));
    fastify.get("/detail/:videoFileId/equalizing", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-equalize'])
    }, AsyncHandler(VideoFileController.getEqualizingVideoFileDetail));

    // =========================

    // specProject routes
    // fastify.post("/specProject/:projectId", CheckUserHaveValidAccessMiddleware([]), AsyncHandler(VideoFileController.getVideoFileOfPath));
    fastify.post("/specProject/init-check/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware([])
    }, AsyncHandler(VideoFileController.getInitCheckVideoFileOfPath));
    fastify.post("/specProject/editor/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-editor'])
    }, AsyncHandler(VideoFileController.getEditorVideoFileOfPath));
    fastify.post("/specProject/equalizing/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-equalize'])
    }, AsyncHandler(VideoFileController.getEqualizingVideoFileOfPath));
    fastify.post("/specProject/equalized/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-equalize'])
    }, AsyncHandler(VideoFileController.getEqualizedVideoFileOfPath));

    fastify.post("/specProject/init/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware([])
    }, AsyncHandler(VideoFileController.getInitVideoFileOfPath));
    fastify.post("/specProject/cleaning/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['video-cleaning'])
    }, AsyncHandler(VideoFileController.getCleaningVideoFileOfPath));
    fastify.post("/specProject/cleaned/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['video-cleaning'])
    }, AsyncHandler(VideoFileController.getCleanedVideoFileOfPath));
    // =========================

    fastify.get("/show/:videoFileId", AsyncHandler(VideoFileController.showVideoFile));

    fastify.get("/log/:videoFileId", {
        preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access", "source-full-access"])
    }, AsyncHandler(VideoFileController.getVideoFileLog));

    fastify.post("/assigned/:videoFileId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['video-to-user', "videos-full-access"])
    }, AsyncHandler(VideoFileController.assignVideoToUser));
    fastify.put("/assigned/:videoFileId/:userId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['video-to-user', "videos-full-access"])
    }, AsyncHandler(VideoFileController.reassignVideo2User));
    fastify.put("/assigned/project/:projectId/:userId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['video-to-user', "videos-full-access"])
    }, AsyncHandler(VideoFileController.reassignVideosOfProject2User));
    fastify.put("/assignedByPath/project/:projectId/:userId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['video-to-user', "videos-full-access"])
    }, AsyncHandler(VideoFileController.reassignVideosByPath));

    /** set important to all videos of project */
    fastify.put("/important/project/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access"])
    }, AsyncHandler(VideoFileController.setImportantVideosOfProject));
    /** set owner to all videos of project */
    fastify.put('/detail/setOwner/:projectId', {
        preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access"])
    }, AsyncHandler(VideoDetailController.setOwner2FilesProject));

    fastify.put("/important/:videoFileId", {
        preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access"])
    }, AsyncHandler(VideoFileController.setImportantEncodeVideo));

    fastify.post("/upload", {
        preHandler: CheckUserHaveValidAccessMiddleware(['video-upload', "videos-full-access"])
    }, AsyncHandler(VideoFileController.uploadVideoFile));
    fastify.post("/upload/:videoFileId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['video-upload', "videos-full-access"])
    }, AsyncHandler(VideoFileController.reassignVideoFile));

    fastify.delete("/:videoFileId", {
        preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access"])
    }, AsyncHandler(VideoFileController.deleteVideoFile));
    fastify.delete("/mainFileProject/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware(["project-manage", "videos-full-access"])
    }, AsyncHandler(VideoFileController.deleteVideoMainFile));

}
module.exports = videoFileRoutes;