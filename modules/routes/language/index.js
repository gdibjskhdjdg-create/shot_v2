const AsyncHandler = require("../../../helper/asyncHandler.tool");
const LanguageController = require("../../controllers/language/Language.controller");
const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");

/* ------------------------------ prefix: /api/language ------------------------------ */
async function languageRoutes(fastify, opts) {
    fastify.addHook('preHandler', OnlyLoginUserMiddleware());

    fastify.get("/", AsyncHandler(LanguageController.get));
    fastify.get("/list", AsyncHandler(LanguageController.getList));
    fastify.get("/shots/:id", AsyncHandler(LanguageController.getShots));
    fastify.post("/", AsyncHandler(LanguageController.create));
    fastify.patch("/:id",
        {
            preHandler: AsyncHandler(CheckUserHaveValidAccessMiddleware(['manage-data']))
        }, AsyncHandler(LanguageController.update));

    fastify.delete("/:id",
        {
            preHandler: AsyncHandler(CheckUserHaveValidAccessMiddleware(['manage-data']))
        }, AsyncHandler(LanguageController.delete));

    fastify.delete("/:id/:shotId",
        {
            preHandler: AsyncHandler(CheckUserHaveValidAccessMiddleware(['manage-data']))
        }, AsyncHandler(LanguageController.detachShot));
}

module.exports = languageRoutes;