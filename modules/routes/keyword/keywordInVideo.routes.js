const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");
const KeywordInVideoController = require("../../controllers/keyword/KeywordInVideo.controller");

/* ------------------------------ prefix: /api/tag/inVideo ------------------------------ */

async function keywordInVideoRoutes(fastify, opts) {

    fastify.get("/", ErrorBoundary(KeywordInVideoController.fetchKeywordsInVideo));
    fastify.get("/shots/:keywordId", ErrorBoundary(KeywordInVideoController.fetchShots));
    fastify.delete("/shots/:shotId/:keywordId", ErrorBoundary(KeywordInVideoController.disconnectShotFromKeyword));
    fastify.delete("/:keywordId", {
        preHandler: AuthorizationMiddleware(['tag-manage'])
    }, ErrorBoundary(KeywordInVideoController.removeKeyword));
}

module.exports = keywordInVideoRoutes;
