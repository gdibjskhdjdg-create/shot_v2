const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const LanguageController = require("../../controllers/language/Language.controller");
const LoginRequiredMiddleware = require("../../middleware/user/LoginRequired.middleware");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");

/* ------------------------------ prefix: /api/language ------------------------------ */
async function languageRoutes(fastify, opts) {
    fastify.addHook('preHandler', LoginRequiredMiddleware());

    fastify.get("/", ErrorBoundary(LanguageController.get));
    fastify.get("/list", ErrorBoundary(LanguageController.list));
    fastify.get("/shots/:id", ErrorBoundary(LanguageController.shots));
    fastify.post("/", ErrorBoundary(LanguageController.create));
    fastify.patch("/:id",
        {
            preHandler: ErrorBoundary(AuthorizationMiddleware(['manage-data']))
        }, ErrorBoundary(LanguageController.update));

    fastify.delete("/:id",
        {
            preHandler: ErrorBoundary(AuthorizationMiddleware(['manage-data']))
        }, ErrorBoundary(LanguageController.destroy));

    fastify.delete("/:id/:shotId",
        {
            preHandler: ErrorBoundary(AuthorizationMiddleware(['manage-data']))
        }, ErrorBoundary(LanguageController.removeShot));
}

module.exports = languageRoutes;