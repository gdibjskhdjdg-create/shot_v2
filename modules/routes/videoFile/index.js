const AsyncHandler = require("../../../helper/asyncHandler.tool");
const { getVideoFiles, getSourceVideoFiles, getProjectVideoFiles, getVideoFile, streamVideoFile, deleteVideoFile } = require("../../controllers/videoFile/VideoFile.controller");
const exportVideoFile = require("./export.routes");
const templateVideoFile = require("./template.routes");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");
const VideoDetailController = require("../../controllers/videoDetail/VideoDetail.controller");
const OnlyAdminMiddleware = require("../../middleware/user/OnlyAdmin.middleware");

async function videoFileRoutes(fastify, opts) {
    fastify.register(exportVideoFile, { prefix: "/export" });
    fastify.register(templateVideoFile, { prefix: "/template" });

    fastify.get("/", {
        preHandler: CheckUserHaveValidAccessMiddleware([])
    }, AsyncHandler(getVideoFiles));

    // fastify.patch("/:videoFileId", {
    //     preHandler: OnlyAdminMiddleware
    // }, AsyncHandler(VideoFileController.updateFileInfo));

    fastify.get("/source", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access'])
    }, AsyncHandler(getSourceVideoFiles));

    fastify.get("/project", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access'])
    }, AsyncHandler(getProjectVideoFiles));

    fastify.get("/detail/:id", {
        preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access'])
    }, AsyncHandler(getVideoFile));

    fastify.get("/show/:id", AsyncHandler(streamVideoFile));

    // fastify.get("/log/:videoFileId", {
    //     preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access", "source-full-access"])
    // }, AsyncHandler(VideoFileController.getVideoFileLog));

    // fastify.post("/assigned/:videoFileId", {
    //     preHandler: CheckUserHaveValidAccessMiddleware(['video-to-user', "videos-full-access"])
    // }, AsyncHandler(VideoFileController.assignVideoToUser));

    // fastify.put("/assigned/:videoFileId/:userId", {
    //     preHandler: CheckUserHaveValidAccessMiddleware(['video-to-user', "videos-full-access"])
    // }, AsyncHandler(VideoFileController.reassignVideo2User));

    // fastify.put("/assigned/project/:projectId/:userId", {
    //     preHandler: CheckUserHaveValidAccessMiddleware(['video-to-user', "videos-full-access"])
    // }, AsyncHandler(VideoFileController.reassignVideosOfProject2User));

    // fastify.put("/assignedByPath/project/:projectId/:userId", {
    //     preHandler: CheckUserHaveValidAccessMiddleware(['video-to-user', "videos-full-access"])
    // }, AsyncHandler(VideoFileController.reassignVideosByPath));

    // fastify.put("/important/project/:projectId", {
    //     preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access"])
    // }, AsyncHandler(VideoFileController.setImportantVideosOfProject));

    // fastify.put('/detail/setOwner/:projectId', {
    //     preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access"])
    // }, AsyncHandler(VideoDetailController.setOwner2FilesProject));

    // fastify.put("/important/:videoFileId", {
    //     preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access"])
    // }, AsyncHandler(VideoFileController.setImportantEncodeVideo));

    // fastify.post("/upload", {
    //     preHandler: CheckUserHaveValidAccessMiddleware(['video-upload', "videos-full-access"])
    // }, AsyncHandler(VideoFileController.uploadVideoFile));

    // fastify.post("/upload/:videoFileId", {
    //     preHandler: CheckUserHaveValidAccessMiddleware(['video-upload', "videos-full-access"])
    // }, AsyncHandler(VideoFileController.reassignVideoFile));

    fastify.delete("/:id", {
        preHandler: CheckUserHaveValidAccessMiddleware(["videos-full-access"])
    }, AsyncHandler(deleteVideoFile));

    // fastify.delete("/mainFileProject/:projectId", {
    //     preHandler: CheckUserHaveValidAccessMiddleware(["project-manage", "videos-full-access"])
    // }, AsyncHandler(VideoFileController.deleteVideoMainFile));
}

module.exports = videoFileRoutes;