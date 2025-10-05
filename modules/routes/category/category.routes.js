const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const CategoryController = require("../../controllers/category/Category.controller");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");

const LoginRequiredMiddleware = require("../../middleware/user/LoginRequired.middleware");

/* ------------------------------ prefix: /api/shotList/category ------------------------------ */
async function categoryRoutes(fastify, opts) {

    fastify.addHook('preHandler', LoginRequiredMiddleware());
    // fastify.get("/", ErrorBoundary(CategoryController.get));
    fastify.get("/list", ErrorBoundary(CategoryController.list));
    fastify.get("/shots/:id", ErrorBoundary(CategoryController.shots));
    fastify.post("/", ErrorBoundary(CategoryController.create));
    fastify.patch("/:id",
        {
            preHandler: ErrorBoundary(AuthorizationMiddleware(['manage-data']))
        }, ErrorBoundary(CategoryController.update));

    fastify.delete("/:id",
        {
            preHandler: ErrorBoundary(AuthorizationMiddleware(['manage-data']))
        }, ErrorBoundary(CategoryController.destroy));

    fastify.delete("/:id/:shotId",
        {
            preHandler: ErrorBoundary(AuthorizationMiddleware(['manage-data']))
        }, ErrorBoundary(CategoryController.removeShot));
}
module.exports = categoryRoutes;