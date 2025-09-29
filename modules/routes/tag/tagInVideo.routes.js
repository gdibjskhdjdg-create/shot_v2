const AsyncHandler = require("../../../helper/asyncHandler.tool");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");
const TagInVideoController = require("../../controllers/tag/TagInVideo.controller");

// tag in video
async function tagInVideoRoutes(fastify, opts) {

    fastify.get("/", AsyncHandler(TagInVideoController.getTagsInVideo));
    fastify.get("/shots/:tagId", AsyncHandler(TagInVideoController.getShots));
    fastify.delete("/shots/:shotId/:tagId", AsyncHandler(TagInVideoController.detachShotFromTag));
    fastify.delete("/:tagId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['tag-manage'])
    }, AsyncHandler(TagInVideoController.deleteTag));
}

module.exports = tagInVideoRoutes;
