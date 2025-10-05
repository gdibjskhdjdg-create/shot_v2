const ErrorBoundary = require("../../../helper/errorBoundary.tool");

const ShotDefaultValueController = require("../../controllers/shotList/ShotDefaultValue.controller");
const LoginRequiredMiddleware = require("../../middleware/user/LoginRequired.middleware");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");

/* ------------------------------ prefix: /api/shotList/defaultValue ------------------------------ */
async function shotDefaultValueRoutes(fastify, opts) {

    fastify.addHook('preHandler', LoginRequiredMiddleware());
    fastify.get("/", ErrorBoundary(ShotDefaultValueController.fetch));
    fastify.get("/list/:section", ErrorBoundary(ShotDefaultValueController.fetchList));
    fastify.get("/shots/:id/:section", ErrorBoundary(ShotDefaultValueController.fetchShots));
    fastify.post("/", ErrorBoundary(ShotDefaultValueController.add));
    fastify.patch("/:id",
        {
            preHandler: ErrorBoundary(AuthorizationMiddleware(['manage-data']))
        }, ErrorBoundary(ShotDefaultValueController.modify));

    fastify.delete("/:id", {
        preHandler: ErrorBoundary(AuthorizationMiddleware(['manage-data']))
    }, ErrorBoundary(ShotDefaultValueController.remove));

    fastify.delete("/:shotId/:section", {
        preHandler: ErrorBoundary(AuthorizationMiddleware(['manage-data']))
    }, ErrorBoundary(ShotDefaultValueController.disconnectShot));
}

module.exports = shotDefaultValueRoutes;