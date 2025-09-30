
const AsyncHandler = require("../../../helper/asyncHandler.tool");
const { listTags, searchTags, getTagDetails, getTagShots, createNewTag, mergeTags, updateTagInfo, removeShotFromTag, permanentlyDeleteTag } = require("../../controllers/tag/Tag.controller");
const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");
const tagCategoryRoute = require("./tagCategory.routes");
const tagInVideoRoute = require("./tagInVideo.routes");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");

/* ------------------------------ prefix: /api/tag ------------------------------ */
async function tagRoutes(fastify, opts) {

    fastify.addHook('preHandler', OnlyLoginUserMiddleware());
    fastify.register(tagCategoryRoute, { prefix: "/category" })
    fastify.register(tagInVideoRoute, { prefix: "/inVideo" })

    fastify.get("/", AsyncHandler(listTags));
    fastify.get("/search", AsyncHandler(searchTags));
    fastify.get("/detail/:tagId", AsyncHandler(getTagDetails));
    fastify.get("/shots/:tagId", AsyncHandler(getTagShots));
    fastify.post("/", AsyncHandler(createNewTag));
    fastify.put("/:sourceTagId/:targetTagId", AsyncHandler(mergeTags));
    fastify.patch("/:tagId", AsyncHandler(updateTagInfo));
    fastify.delete("/shots/:shotId/:tagId", AsyncHandler(removeShotFromTag));
    fastify.delete("/:tagId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['tag-manage'])
        }, AsyncHandler(permanentlyDeleteTag));

}

module.exports = tagRoutes;
