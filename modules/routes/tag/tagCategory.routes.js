const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const TagCategoryController = require("../../controllers/tag/TagCategory.controller");
const LoginRequiredMiddleware = require("../../middleware/user/LoginRequired.middleware");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");

/* ------------------------------ prefix: /api/tag/category ------------------------------ */
async function tagCategoryRoutes(fastify, opts) {

    fastify.addHook('preHandler', LoginRequiredMiddleware());
    fastify.get("/", ErrorBoundary(TagCategoryController.fetchList));
    fastify.get("/detail/:tagCategoryId", ErrorBoundary(TagCategoryController.fetchDetail));
    fastify.get("/show/:tagCategoryId", ErrorBoundary(TagCategoryController.displayCategory));
    fastify.post("/",
        {
            preHandler: AuthorizationMiddleware(["tag-category-manage"])
        }, ErrorBoundary(TagCategoryController.addTagCategory));

    fastify.patch("/:tagCategoryId",
        {
            preHandler: AuthorizationMiddleware(["tag-category-manage"])
        }, ErrorBoundary(TagCategoryController.modifyTagCategory));

    fastify.delete("/:tagCategoryId",
        {
            preHandler: AuthorizationMiddleware(["tag-category-manage"])
        }, ErrorBoundary(TagCategoryController.removeTagCategory));
}

module.exports = tagCategoryRoutes;