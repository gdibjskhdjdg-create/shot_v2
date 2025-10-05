const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");
const TagInVideoController = require("../../controllers/tag/TagInVideo.controller");

// tag in video
async function tagInVideoRoutes(fastify, opts) {

    fastify.get("/", ErrorBoundary(TagInVideoController.fetchTagsInVideo));
    fastify.get("/shots/:tagId", ErrorBoundary(TagInVideoController.fetchShots));
    fastify.delete("/shots/:shotId/:tagId", ErrorBoundary(TagInVideoController.disconnectShotFromTag));
    fastify.delete("/:tagId", {
        preHandler: AuthorizationMiddleware(['tag-manage'])
    }, ErrorBoundary(TagInVideoController.removeTag));
}

module.exports = tagInVideoRoutes;
