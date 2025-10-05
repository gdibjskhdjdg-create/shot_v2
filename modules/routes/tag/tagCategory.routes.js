const AsyncHandler = require("../../../helper/asyncHandler.tool");
const TagCategoryController = require("../../controllers/tag/TagCategory.controller");
const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user//CheckUserHaveValidAccess.middleware");

/* ------------------------------ prefix: /api/tag/category ------------------------------ */
async function tagCategoryRoutes(fastify, opts) {

    fastify.addHook('preHandler', OnlyLoginUserMiddleware());
    fastify.get("/", AsyncHandler(TagCategoryController.fetchList));
    fastify.get("/detail/:tagCategoryId", AsyncHandler(TagCategoryController.fetchDetail));
    fastify.get("/show/:tagCategoryId", AsyncHandler(TagCategoryController.displayCategory));
    fastify.post("/",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(["tag-category-manage"])
        }, AsyncHandler(TagCategoryController.createTagCategory));

    fastify.patch("/:tagCategoryId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(["tag-category-manage"])
        }, AsyncHandler(TagCategoryController.addTagCategory));

    fastify.delete("/:tagCategoryId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(["tag-category-manage"])
        }, AsyncHandler(TagCategoryController.removeTagCategory));
}

module.exports = tagCategoryRoutes;