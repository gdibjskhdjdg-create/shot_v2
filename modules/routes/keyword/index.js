const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const KeywordController = require("../../controllers/keyword/Keyword.controller");
const LoginRequiredMiddleware = require("../../middleware/user/LoginRequired.middleware");
const keywordCategoryRoute = require("./keywordCategory.routes");
const keywordInVideoRoute = require("./keywordInVideo.routes");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");

/* ------------------------------ prefix: /api/tag ------------------------------ */
async function keywordRoutes(fastify, opts) {

    fastify.addHook('preHandler', LoginRequiredMiddleware());
    fastify.register(keywordCategoryRoute, { prefix: "/category" })
    fastify.register(keywordInVideoRoute, { prefix: "/inVideo" })

    fastify.get("/", ErrorBoundary(KeywordController.list));
    fastify.get("/search", ErrorBoundary(KeywordController.suggestions));
    fastify.get("/detail/:keywordId", ErrorBoundary(KeywordController.show));
    fastify.get("/shots/:keywordId", ErrorBoundary(KeywordController.shots));
    fastify.post("/", ErrorBoundary(KeywordController.newItem));
    fastify.put("/:sourceKeywordId/:targetKeywordId", ErrorBoundary(KeywordController.combine));
    fastify.patch("/:keywordId", ErrorBoundary(KeywordController.update));
    fastify.delete("/shots/:shotId/:keywordId", ErrorBoundary(KeywordController.removeShot));
    fastify.delete("/:keywordId",
        {
            preHandler: AuthorizationMiddleware(['tag-manage'])
        }, ErrorBoundary(KeywordController.destroy));

}

module.exports = keywordRoutes;