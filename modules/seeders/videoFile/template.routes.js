const AsyncHandler = require("../../../helper/asyncHandler.tool");

const VideoTemplateController = require("../controller/VideoTemplate.controller");
const CheckUserHaveValidAccessMiddleware = require("../../user/middleware/CheckUserHaveValidAccess.middleware");

/* ------------------------------ prefix: /api/videoFile/template ------------------------------ */

async function videoTemplateRoutes(fastify, opts) {

    fastify.addHook('preHandler', CheckUserHaveValidAccessMiddleware(['template-manage']));

    fastify.get('/', AsyncHandler(VideoTemplateController.getVideoTemplateList))
    fastify.get('/:templateId', AsyncHandler(VideoTemplateController.showVideoTemplate))
    fastify.post("/", AsyncHandler(VideoTemplateController.createVideoTemplate))
    fastify.patch("/:templateId", AsyncHandler(VideoTemplateController.updateVideoTemplate))
    fastify.delete("/:templateId", AsyncHandler(VideoTemplateController.deleteVideoTemplate))

}
module.exports = videoTemplateRoutes;