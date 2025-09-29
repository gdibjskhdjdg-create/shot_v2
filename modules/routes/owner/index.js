const AsyncHandler = require("../../../helper/asyncHandler.tool");
const OwnerController = require("../../controllers/owner/Owner.controller");

const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");

/* ------------------------------ prefix: /api/owner ------------------------------ */
async function ownerRoutes(fastify, opts) {
    fastify.addHook('preHandler', OnlyLoginUserMiddleware());

    fastify.get("/", AsyncHandler(OwnerController.getList));
    fastify.post("/", AsyncHandler(OwnerController.create));
    fastify.patch("/:id", AsyncHandler(OwnerController.update));
    fastify.delete("/:id", AsyncHandler(OwnerController.delete));
}
module.exports = ownerRoutes;