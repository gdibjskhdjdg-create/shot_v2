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

    fastify.get("/", AsyncHandler(TagController.tags));
    fastify.get("/search", AsyncHandler(TagController.suggestions));
    fastify.get("/detail/:tagId", AsyncHandler(TagController.show));
    fastify.get("/shots/:tagId", AsyncHandler(TagController.shots));
    fastify.post("/", AsyncHandler(TagController.newItem));
    fastify.put("/:sourceTagId/:targetTagId", AsyncHandler(TagController.combine));
    fastify.patch("/:tagId", AsyncHandler(TagController.update));
    fastify.delete("/shots/:shotId/:tagId", AsyncHandler(TagController.removeShot));
    fastify.delete("/:tagId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['tag-manage'])
        }, AsyncHandler(TagController.destroy));

}

module.exports = tagRoutes;