const AsyncHandler = require("../../../helper/asyncHandler.tool");
const TagController = require("../../controllers/tag/Tag.controller");
const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");
const tagCategoryRoute = require("./tagCategory.routes");
const tagInVideoRoute = require("./tagInVideo.routes");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");

/* ------------------------------ prefix: /api/tag ------------------------------ */
async function tagRoutes(fastify, opts) {

    fastify.addHook('preHandler', OnlyLoginUserMiddleware());
    fastify.register(tagCategoryRoute, { prefix: "/category" })
    fastify.register(tagInVideoRoute, { prefix: "/inVideo" })

    fastify.get("/", AsyncHandler(TagController.getList));
    fastify.get("/search", AsyncHandler(TagController.searchTag));
    fastify.get("/detail/:tagId", AsyncHandler(TagController.getDetail));
    fastify.get("/shots/:tagId", AsyncHandler(TagController.getShots));
    fastify.post("/", AsyncHandler(TagController.createTag));
    fastify.put("/:sourceTagId/:targetTagId", AsyncHandler(TagController.mergeTag));
    fastify.patch("/:tagId", AsyncHandler(TagController.editTag));
    fastify.delete("/shots/:shotId/:tagId", AsyncHandler(TagController.detachShotFromTag));
    fastify.delete("/:tagId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['tag-manage'])
        }, AsyncHandler(TagController.deleteTag));

}

module.exports = tagRoutes;