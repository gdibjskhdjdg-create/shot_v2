const AsyncHandler = require("../../../helper/asyncHandler.tool");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");
const TagInVideoController = require("../../controllers/tag/TagInVideo.controller");

// tag in video
async function tagInVideoRoutes(fastify, opts) {

    fastify.get("/", AsyncHandler(TagInVideoController.fetchTagsInVideo));
    fastify.get("/shots/:tagId", AsyncHandler(TagInVideoController.fetchShots));
    fastify.delete("/shots/:shotId/:tagId", AsyncHandler(TagInVideoController.disconnectShotFromTag));
    fastify.delete("/:tagId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['tag-manage'])
    }, AsyncHandler(TagInVideoController.removeTag));
}

module.exports = tagInVideoRoutes;
