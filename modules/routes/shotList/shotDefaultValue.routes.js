const AsyncHandler = require("../../../helper/asyncHandler.tool");

const ShotDefaultValueController = require("../../controllers/shotList/ShotDefaultValue.controller");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");
const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");

/* ------------------------------ prefix: /api/shotList/defaultValue ------------------------------ */
async function shotDefaultValueRoutes(fastify, opts) {

    fastify.addHook('preHandler', OnlyLoginUserMiddleware());
    fastify.get("/", AsyncHandler(ShotDefaultValueController.get));
    fastify.get("/list/:section", AsyncHandler(ShotDefaultValueController.getList));
    fastify.get("/shots/:id/:section", AsyncHandler(ShotDefaultValueController.getShots));
    fastify.post("/", AsyncHandler(ShotDefaultValueController.create));
    fastify.patch("/:id",
        {
            preHandler: AsyncHandler(CheckUserHaveValidAccessMiddleware(['manage-data']))
        }, AsyncHandler(ShotDefaultValueController.update));

    fastify.delete("/:id", {
        preHandler: AsyncHandler(CheckUserHaveValidAccessMiddleware(['manage-data']))
    }, AsyncHandler(ShotDefaultValueController.delete));

    fastify.delete("/:shotId/:section", {
        preHandler: AsyncHandler(CheckUserHaveValidAccessMiddleware(['manage-data']))
    }, AsyncHandler(ShotDefaultValueController.detachShot));
}

module.exports = shotDefaultValueRoutes;