const AsyncHandler = require("../../../helper/asyncHandler.tool");

const ExportVideoFileController = require("../../controllers/ExportVideoFile.controllers");
const CheckUserHaveValidAccessMiddleware = require("../../user/middleware/CheckUserHaveValidAccess.middleware");

/* ------------------------------ prefix: /api/videoFile/export ------------------------------ */
// router.post('/send2Product/:exportId' , AsyncHandler(ExportVideoFileController.send2Product))

async function exportRoutes(fastify, opts) {

    fastify.get('/getDownloadUrl/:id', AsyncHandler(ExportVideoFileController.downloadExportFileUrl))
    fastify.get('/getFileUrl/:id', AsyncHandler(ExportVideoFileController.showExportFile))
    fastify.get('/getpath/:id', AsyncHandler(ExportVideoFileController.getPathExportFile))


    fastify.register(async (fastifyProtected, opts) => {
        fastifyProtected.addHook('preHandler', CheckUserHaveValidAccessMiddleware(['studio-manage']));
        fastifyProtected.get('/', AsyncHandler(ExportVideoFileController.fetchFiles));
        fastifyProtected.get('/shots/:exportId', AsyncHandler(ExportVideoFileController.shots));
        fastifyProtected.get("/sendToSite/:exportId", AsyncHandler(ExportVideoFileController.getLogSite));
        fastifyProtected.get('/:id', AsyncHandler(ExportVideoFileController.getExportFile));
        fastifyProtected.post("/shots", AsyncHandler(ExportVideoFileController.createExportShots));
        fastifyProtected.post("/videos", AsyncHandler(ExportVideoFileController.createExportVideos));
        fastifyProtected.post("/", AsyncHandler(ExportVideoFileController.createExportFiles));
        fastifyProtected.post("/sendToSite/:exportId", AsyncHandler(ExportVideoFileController.reqToSendToSite));
        fastifyProtected.put('/modifyFile/:exportId', AsyncHandler(ExportVideoFileController.modifyFile));
        fastifyProtected.post('/rebuildFile/:exportId', AsyncHandler(ExportVideoFileController.rebuildFile));
        fastifyProtected.post('/sendFiles2Rush', AsyncHandler(ExportVideoFileController.sendFiles2Rush));
        fastifyProtected.put('/important/:exportId', AsyncHandler(ExportVideoFileController.setImportantExportFile));
        fastifyProtected.delete("/", AsyncHandler(ExportVideoFileController.destroyExportFiles));
    })
}

module.exports = exportRoutes;