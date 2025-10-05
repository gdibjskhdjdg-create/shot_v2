const ErrorBoundary = require("../../../helper/errorBoundary.tool");

const ExportVideoFileController = require("../../controllers/videoFile/ExportVideoFile.controller");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");

/* ------------------------------ prefix: /api/videoFile/export ------------------------------ */
// router.post('/send2Product/:exportId' , ErrorBoundary(ExportVideoFileController.send2Product))

async function exportRoutes(fastify, opts) {

    fastify.get('/getDownloadUrl/:id', ErrorBoundary(ExportVideoFileController.downloadUrl))
    fastify.get('/getFileUrl/:id', ErrorBoundary(ExportVideoFileController.show))
    fastify.get('/getpath/:id', ErrorBoundary(ExportVideoFileController.pathFile))


    fastify.register(async (fastifyProtected, opts) => {
        fastifyProtected.addHook('preHandler', AuthorizationMiddleware(['studio-manage']));
        fastifyProtected.get('/', ErrorBoundary(ExportVideoFileController.fetchFiles));
        fastifyProtected.get('/shots/:exportId', ErrorBoundary(ExportVideoFileController.shots));
        fastifyProtected.get("/sendToSite/:exportId", ErrorBoundary(ExportVideoFileController.logsSite));
        fastifyProtected.get('/:id', ErrorBoundary(ExportVideoFileController.detailFile));
        fastifyProtected.post("/shots", ErrorBoundary(ExportVideoFileController.addShots));
        fastifyProtected.post("/videos", ErrorBoundary(ExportVideoFileController.addVideos));
        fastifyProtected.post("/", ErrorBoundary(ExportVideoFileController.addFiles));
        fastifyProtected.post("/sendToSite/:exportId", ErrorBoundary(ExportVideoFileController.add2SiteQueue));
        fastifyProtected.put('/modifyFile/:exportId', ErrorBoundary(ExportVideoFileController.update));
        fastifyProtected.post('/rebuildFile/:exportId', ErrorBoundary(ExportVideoFileController.regenerate));
        fastifyProtected.post('/sendFiles2Rush', ErrorBoundary(ExportVideoFileController.sendFiles2Site));
        fastifyProtected.put('/important/:exportId', ErrorBoundary(ExportVideoFileController.setFileIsImportant));
        fastifyProtected.delete("/", ErrorBoundary(ExportVideoFileController.destroyItems));
    })
}

module.exports = exportRoutes;