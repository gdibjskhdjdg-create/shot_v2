const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const TagController = require("../../controllers/tag/Tag.controller");
const LoginRequiredMiddleware = require("../../middleware/user/LoginRequired.middleware");
const tagCategoryRoute = require("./tagCategory.routes");
const tagInVideoRoute = require("./tagInVideo.routes");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");

/* ------------------------------ prefix: /api/tag ------------------------------ */
async function tagRoutes(fastify, opts) {

    fastify.addHook('preHandler', LoginRequiredMiddleware());
    fastify.register(tagCategoryRoute, { prefix: "/category" })
    fastify.register(tagInVideoRoute, { prefix: "/inVideo" })

    fastify.get("/", ErrorBoundary(TagController.list));
    fastify.get("/search", ErrorBoundary(TagController.suggestions));
    fastify.get("/detail/:tagId", ErrorBoundary(TagController.show));
    fastify.get("/shots/:tagId", ErrorBoundary(TagController.shots));
    fastify.post("/", ErrorBoundary(TagController.newItem));
    fastify.put("/:sourceTagId/:targetTagId", ErrorBoundary(TagController.combine));
    fastify.patch("/:tagId", ErrorBoundary(TagController.update));
    fastify.delete("/shots/:shotId/:tagId", ErrorBoundary(TagController.removeShot));
    fastify.delete("/:tagId",
        {
            preHandler: AuthorizationMiddleware(['tag-manage'])
        }, ErrorBoundary(TagController.destroy));

}

module.exports = tagRoutes;