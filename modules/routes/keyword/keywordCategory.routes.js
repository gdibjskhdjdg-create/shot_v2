const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const KeywordCategoryController = require("../../controllers/keyword/KeywordCategory.controller");
const LoginRequiredMiddleware = require("../../middleware/user/LoginRequired.middleware");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");

/* ------------------------------ prefix: /api/tag/category ------------------------------ */
async function keywordCategoryRoutes(fastify, opts) {

    fastify.addHook('preHandler', LoginRequiredMiddleware());
    fastify.get("/", ErrorBoundary(KeywordCategoryController.fetchList));
    fastify.get("/detail/:keywordCategoryId", ErrorBoundary(KeywordCategoryController.fetchDetail));
    fastify.get("/show/:keywordCategoryId", ErrorBoundary(KeywordCategoryController.displayCategory));
    fastify.post("/",
        {
            preHandler: AuthorizationMiddleware(["tag-category-manage"])
        }, ErrorBoundary(KeywordCategoryController.addKeywordCategory));

    fastify.patch("/:keywordCategoryId",
        {
            preHandler: AuthorizationMiddleware(["tag-category-manage"])
        }, ErrorBoundary(KeywordCategoryController.modifyKeywordCategory));

    fastify.delete("/:keywordCategoryId",
        {
            preHandler: AuthorizationMiddleware(["tag-category-manage"])
        }, ErrorBoundary(KeywordCategoryController.removeKeywordCategory));
}

module.exports = keywordCategoryRoutes;