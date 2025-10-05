const AsyncHandler = require("../../../helper/asyncHandler.tool");
const CategoryController = require("../../controllers/category/Category.controller");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");

const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");

/* ------------------------------ prefix: /api/shotList/category ------------------------------ */
async function categoryRoutes(fastify, opts) {

    fastify.addHook('preHandler', OnlyLoginUserMiddleware());
    // fastify.get("/", AsyncHandler(CategoryController.get));
    fastify.get("/list", AsyncHandler(CategoryController.list));
    fastify.get("/shots/:id", AsyncHandler(CategoryController.shots));
    fastify.post("/", AsyncHandler(CategoryController.create));
    fastify.patch("/:id",
        {
            preHandler: AsyncHandler(CheckUserHaveValidAccessMiddleware(['manage-data']))
        }, AsyncHandler(CategoryController.update));

    fastify.delete("/:id",
        {
            preHandler: AsyncHandler(CheckUserHaveValidAccessMiddleware(['manage-data']))
        }, AsyncHandler(CategoryController.destroy));

    fastify.delete("/:id/:shotId",
        {
            preHandler: AsyncHandler(CheckUserHaveValidAccessMiddleware(['manage-data']))
        }, AsyncHandler(CategoryController.removeShot));
}
module.exports = categoryRoutes;