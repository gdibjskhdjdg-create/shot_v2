const AsyncHandler = require("../../../helper/asyncHandler.tool");
const TagCategoryController = require("../../controllers/tag/TagCategory.controller");
const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user//CheckUserHaveValidAccess.middleware");

/* ------------------------------ prefix: /api/tag/category ------------------------------ */
async function tagCategoryRoutes(fastify, opts) {

    fastify.addHook('preHandler', OnlyLoginUserMiddleware());
    fastify.get("/", AsyncHandler(TagCategoryController.getList));
    fastify.get("/detail/:tagCategoryId", AsyncHandler(TagCategoryController.getDetail));
    fastify.get("/show/:tagCategoryId", AsyncHandler(TagCategoryController.showCategory));
    fastify.post("/",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(["tag-category-manage"])
        }, AsyncHandler(TagCategoryController.createTagCategory));

    fastify.patch("/:tagCategoryId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(["tag-category-manage"])
        }, AsyncHandler(TagCategoryController.editTagCategory));

    fastify.delete("/:tagCategoryId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(["tag-category-manage"])
        }, AsyncHandler(TagCategoryController.deleteTagCategory));
}

module.exports = tagCategoryRoutes;