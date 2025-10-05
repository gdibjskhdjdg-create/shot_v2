const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const OwnerController = require("../../controllers/owner/Owner.controller");

const LoginRequiredMiddleware = require("../../middleware/user/LoginRequired.middleware");

/* ------------------------------ prefix: /api/owner ------------------------------ */
async function ownerRoutes(fastify, opts) {
    fastify.addHook('preHandler', LoginRequiredMiddleware());

    fastify.get("/", ErrorBoundary(OwnerController.list));
    fastify.post("/", ErrorBoundary(OwnerController.create));
    fastify.patch("/:id", ErrorBoundary(OwnerController.update));
    fastify.delete("/:id", ErrorBoundary(OwnerController.destroy));
}
module.exports = ownerRoutes;