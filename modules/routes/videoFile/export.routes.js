const AsyncHandler = require("../../../helper/asyncHandler.tool");

const ExportVideoFileController = require("../../controllers/videoFile/ExportVideoFile.controller");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");

/* ------------------------------ prefix: /api/videoFile/export ------------------------------ */
// router.post('/send2Product/:exportId' , AsyncHandler(ExportVideoFileController.send2Product))

async function exportRoutes(fastify, opts) {

    fastify.get('/getDownloadUrl/:id', AsyncHandler(ExportVideoFileController.downloadUrl))
    fastify.get('/getFileUrl/:id', AsyncHandler(ExportVideoFileController.show))
    fastify.get('/getpath/:id', AsyncHandler(ExportVideoFileController.pathFile))


    fastify.register(async (fastifyProtected, opts) => {
        fastifyProtected.addHook('preHandler', CheckUserHaveValidAccessMiddleware(['studio-manage']));
        fastifyProtected.get('/', AsyncHandler(ExportVideoFileController.fetchFiles));
        fastifyProtected.get('/shots/:exportId', AsyncHandler(ExportVideoFileController.shots));
        fastifyProtected.get("/sendToSite/:exportId", AsyncHandler(ExportVideoFileController.logsSite));
        fastifyProtected.get('/:id', AsyncHandler(ExportVideoFileController.detailFile));
        fastifyProtected.post("/shots", AsyncHandler(ExportVideoFileController.addShots));
        fastifyProtected.post("/videos", AsyncHandler(ExportVideoFileController.addVideos));
        fastifyProtected.post("/", AsyncHandler(ExportVideoFileController.addFiles));
        fastifyProtected.post("/sendToSite/:exportId", AsyncHandler(ExportVideoFileController.add2SiteQueue));
        fastifyProtected.put('/modifyFile/:exportId', AsyncHandler(ExportVideoFileController.update));
        fastifyProtected.post('/rebuildFile/:exportId', AsyncHandler(ExportVideoFileController.regenerate));
        fastifyProtected.post('/sendFiles2Rush', AsyncHandler(ExportVideoFileController.sendFiles2Site));
        fastifyProtected.put('/important/:exportId', AsyncHandler(ExportVideoFileController.setFileIsImportant));
        fastifyProtected.delete("/", AsyncHandler(ExportVideoFileController.destroyItems));
    })
}

module.exports = exportRoutes;