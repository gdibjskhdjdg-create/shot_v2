const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const VideoTemplateController = require("../../controllers/videoFile/VideoTemplate.controller");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");

/* ------------------------------ prefix: /api/videoFile/template ------------------------------ */

async function videoTemplateRoutes(fastify, opts) {

    fastify.addHook('preHandler', AuthorizationMiddleware(['template-manage']));

    fastify.get('/', ErrorBoundary(VideoTemplateController.fetchList))
    fastify.get('/:templateId', ErrorBoundary(VideoTemplateController.show))
    fastify.post("/", ErrorBoundary(VideoTemplateController.create))
    fastify.patch("/:templateId", ErrorBoundary(VideoTemplateController.update))
    fastify.delete("/:templateId", ErrorBoundary(VideoTemplateController.destroy))

}
module.exports = videoTemplateRoutes;