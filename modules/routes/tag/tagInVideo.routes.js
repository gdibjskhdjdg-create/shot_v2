
const AsyncHandler = require("../../../helper/asyncHandler.tool");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");
const {
    listTagsInVideo,
    getShotsForTagInVideo,
    removeShotFromTagInVideo,
    permanentlyDeleteTagInVideo,
} = require("../../controllers/tag/TagInVideo.controller");

// tag in video
async function tagInVideoRoutes(fastify, opts) {

    fastify.get("/", AsyncHandler(listTagsInVideo));
    fastify.get("/shots/:tagId", AsyncHandler(getShotsForTagInVideo));
    fastify.delete("/shots/:shotId/:tagId", AsyncHandler(removeShotFromTagInVideo));
    fastify.delete("/:tagId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['tag-manage'])
    }, AsyncHandler(permanentlyDeleteTagInVideo));
}

module.exports = tagInVideoRoutes;
