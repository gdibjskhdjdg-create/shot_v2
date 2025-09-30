const AsyncHandler = require("../../../helper/asyncHandler.tool");

const {
    getDefaultValue,
    listAllDefaultValues,
    listShotsBySpecificDefaultValue,
    createDefaultValue,
    updateDefaultValue,
    deleteDefaultValue,
    detachShotFromSpecificDefaultValue
} = require("../../controllers/shotList/ShotDefaultValue.controller");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");
const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");

/* ------------------------------ prefix: /api/shotList/defaultValue ------------------------------ */
async function shotDefaultValueRoutes(fastify, opts) {

    fastify.addHook('preHandler', OnlyLoginUserMiddleware());
    fastify.get("/", AsyncHandler(getDefaultValue));
    fastify.get("/list/:section", AsyncHandler(listAllDefaultValues));
    fastify.get("/shots/:id/:section", AsyncHandler(listShotsBySpecificDefaultValue));
    fastify.post("/", AsyncHandler(createDefaultValue));
    fastify.patch("/:id",
        {
            preHandler: AsyncHandler(CheckUserHaveValidAccessMiddleware(['manage-data']))
        }, AsyncHandler(updateDefaultValue));

    fastify.delete("/:id", {
        preHandler: AsyncHandler(CheckUserHaveValidAccessMiddleware(['manage-data']))
    }, AsyncHandler(deleteDefaultValue));

    fastify.delete("/:shotId/:section", {
        preHandler: AsyncHandler(CheckUserHaveValidAccessMiddleware(['manage-data']))
    }, AsyncHandler(detachShotFromSpecificDefaultValue));
}

module.exports = shotDefaultValueRoutes;
