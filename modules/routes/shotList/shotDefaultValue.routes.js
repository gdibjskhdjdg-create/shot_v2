const AsyncHandler = require("../../../helper/asyncHandler.tool");

const ShotDefaultValueController = require("../../controllers/shotList/ShotDefaultValue.controller");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");
const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");

/* ------------------------------ prefix: /api/shotList/defaultValue ------------------------------ */
async function shotDefaultValueRoutes(fastify, opts) {

    fastify.addHook('preHandler', OnlyLoginUserMiddleware());
    fastify.get("/", AsyncHandler(ShotDefaultValueController.fetch));
    fastify.get("/list/:section", AsyncHandler(ShotDefaultValueController.fetchList));
    fastify.get("/shots/:id/:section", AsyncHandler(ShotDefaultValueController.fetchShots));
    fastify.post("/", AsyncHandler(ShotDefaultValueController.add));
    fastify.patch("/:id",
        {
            preHandler: AsyncHandler(CheckUserHaveValidAccessMiddleware(['manage-data']))
        }, AsyncHandler(ShotDefaultValueController.modify));

    fastify.delete("/:id", {
        preHandler: AsyncHandler(CheckUserHaveValidAccessMiddleware(['manage-data']))
    }, AsyncHandler(ShotDefaultValueController.remove));

    fastify.delete("/:shotId/:section", {
        preHandler: AsyncHandler(CheckUserHaveValidAccessMiddleware(['manage-data']))
    }, AsyncHandler(ShotDefaultValueController.disconnectShot));
}

module.exports = shotDefaultValueRoutes;