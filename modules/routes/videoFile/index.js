const ErrorBoundary = require("../../../helper/errorBoundary.tool");

const VideoFileController = require("../../controllers/videoFile/VideoFile.controller");

const exportVideoFile = require("./export.routes")
const templateVideoFile = require("./template.routes");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");
const VideoInfoController = require("../../controllers/videoInfo/VideoInfo.controller");
const StrictlyAdminMiddleware = require("../../middleware/user/StrictlyAdmin.middleware");


async function videoFileRoutes(fastify, opts) {

    fastify.register(exportVideoFile, { prefix: "/export" });
    fastify.register(templateVideoFile, { prefix: "/template" });

    /* ------------------------------ prefix: /api/videoFile ------------------------------ */
    fastify.get("/", {
        preHandler: AuthorizationMiddleware([])
    }, ErrorBoundary(VideoFileController.fetchVideoFileList));

    fastify.patch("/:videoFileId", {
        preHandler: StrictlyAdminMiddleware
    }, ErrorBoundary(VideoFileController.modifyFileInfo));

    // sources list routes
    fastify.get("/canBeShot", {
        preHandler: AuthorizationMiddleware(['shot-full-access'])
    }, ErrorBoundary(VideoFileController.fetchVideoFileListCanBeShot));

    fastify.get("/canBeShot/init-check", {
        preHandler: AuthorizationMiddleware([])
    }, ErrorBoundary(VideoFileController.fetchInitCheckListCanBeShot));

    fastify.get("/canBeShot/editor", {
        preHandler: AuthorizationMiddleware(['shot-full-access', 'shot-list-editor'])
    }, ErrorBoundary(VideoFileController.fetchEditorCheckListCanBeShot));
    fastify.get("/canBeShot/equalizing", {
        preHandler: AuthorizationMiddleware(['shot-full-access', 'shot-list-equalize'])
    }, ErrorBoundary(VideoFileController.fetchEqualizingCheckListCanBeShot));
    fastify.get("/canBeShot/equalized", {
        preHandler: AuthorizationMiddleware(['shot-full-access', 'shot-list-equalize'])
    }, ErrorBoundary(VideoFileController.fetchEqualizedCheckListCanBeShot));
    // ========================

    // sources detail list routes
    fastify.get("/detail/:videoFileId", {
        preHandler: AuthorizationMiddleware(['shot-full-access'])
    }, ErrorBoundary(VideoFileController.fetchDetail));
    fastify.get("/detail/:videoFileId/init-check", {
        preHandler: AuthorizationMiddleware([])
    }, ErrorBoundary(VideoFileController.fetchInitDetail));
    fastify.get("/detail/:videoFileId/editor", {
        preHandler: AuthorizationMiddleware(['shot-full-access', 'shot-list-editor'])
    }, ErrorBoundary(VideoFileController.fetchEditorDetail));
    fastify.get("/detail/:videoFileId/equalizing", {
        preHandler: AuthorizationMiddleware(['shot-full-access', 'shot-list-equalize'])
    }, ErrorBoundary(VideoFileController.fetchEqualizingDetail));

    // =========================

    // specProject routes
    // fastify.post("/specProject/:projectId", AuthorizationMiddleware([]), ErrorBoundary(VideoFileController.getVideoFileOfPath));
    fastify.post("/specProject/init-check/:projectId", {
        preHandler: AuthorizationMiddleware([])
    }, ErrorBoundary(VideoFileController.fetchInitCheckVideoFileOfPath));
    fastify.post("/specProject/editor/:projectId", {
        preHandler: AuthorizationMiddleware(['shot-full-access', 'shot-list-editor'])
    }, ErrorBoundary(VideoFileController.fetchEditorVideoFileOfPath));
    fastify.post("/specProject/equalizing/:projectId", {
        preHandler: AuthorizationMiddleware(['shot-full-access', 'shot-list-equalize'])
    }, ErrorBoundary(VideoFileController.fetchEqualizingVideoFileOfPath));
    fastify.post("/specProject/equalized/:projectId", {
        preHandler: AuthorizationMiddleware(['shot-full-access', 'shot-list-equalize'])
    }, ErrorBoundary(VideoFileController.fetchEqualizedVideoFileOfPath));

    fastify.post("/specProject/init/:projectId", {
        preHandler: AuthorizationMiddleware([])
    }, ErrorBoundary(VideoFileController.fetchInitVideoFileOfPath));
    fastify.post("/specProject/cleaning/:projectId", {
        preHandler: AuthorizationMiddleware(['video-cleaning'])
    }, ErrorBoundary(VideoFileController.fetchCleaningVideoFileOfPath));
    fastify.post("/specProject/cleaned/:projectId", {
        preHandler: AuthorizationMiddleware(['video-cleaning'])
    }, ErrorBoundary(VideoFileController.fetchCleanedVideoFileOfPath));
    // =========================

    fastify.get("/show/:videoFileId", ErrorBoundary(VideoFileController.streamVideoFile));

    fastify.get("/log/:videoFileId", {
        preHandler: AuthorizationMiddleware(["videos-full-access", "source-full-access"])
    }, ErrorBoundary(VideoFileController.fetchVideoFileLog));

    fastify.post("/assigned/:videoFileId", {
        preHandler: AuthorizationMiddleware(['video-to-user', "videos-full-access"])
    }, ErrorBoundary(VideoFileController.assignVideoToUserByQuery));
    fastify.put("/assigned/:videoFileId/:userId", {
        preHandler: AuthorizationMiddleware(['video-to-user', "videos-full-access"])
    }, ErrorBoundary(VideoFileController.reassignVideoToUser));
    fastify.put("/assigned/project/:projectId/:userId", {
        preHandler: AuthorizationMiddleware(['video-to-user', "videos-full-access"])
    }, ErrorBoundary(VideoFileController.reassignProjectVideosToUser));
    fastify.put("/assignedByPath/project/:projectId/:userId", {
        preHandler: AuthorizationMiddleware(['video-to-user', "videos-full-access"])
    }, ErrorBoundary(VideoFileController.reassignVideosByPathToUser));

    /** set important to all videos of project */
    fastify.put("/important/project/:projectId", {
        preHandler: AuthorizationMiddleware(["videos-full-access"])
    }, ErrorBoundary(VideoFileController.markImportantVideosOfProject));
    /** set owner to all videos of project */
    fastify.put('/detail/setOwner/:projectId', {
        preHandler: AuthorizationMiddleware(["videos-full-access"])
    }, ErrorBoundary(VideoInfoController.assignOwnerToProjectFiles));

    fastify.put("/important/:videoFileId", {
        preHandler: AuthorizationMiddleware(["videos-full-access"])
    }, ErrorBoundary(VideoFileController.markImportantEncodeVideo));

    fastify.post("/upload", {
        preHandler: AuthorizationMiddleware(['video-upload', "videos-full-access"])
    }, ErrorBoundary(VideoFileController.importVideoFile));
    fastify.post("/upload/:videoFileId", {
        preHandler: AuthorizationMiddleware(['video-upload', "videos-full-access"])
    }, ErrorBoundary(VideoFileController.reimportVideoFile));

    fastify.delete("/:videoFileId", {
        preHandler: AuthorizationMiddleware(["videos-full-access"])
    }, ErrorBoundary(VideoFileController.removeVideoFile));
    fastify.delete("/mainFileProject/:projectId", {
        preHandler: AuthorizationMiddleware(["project-manage", "videos-full-access"])
    }, ErrorBoundary(VideoFileController.removeVideoMainFile));

}
module.exports = videoFileRoutes;