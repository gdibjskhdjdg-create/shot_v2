
const AsyncHandler = require("../../../helper/asyncHandler.tool");
const { 
    listTagCategories,
    getTagCategoryDetails,
    createNewTagCategory,
    updateTagCategoryInfo,
    permanentlyDeleteTagCategory
} = require("../../controllers/tag/TagCategory.controller");
const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user//CheckUserHaveValidAccess.middleware");

/* ------------------------------ prefix: /api/tag/category ------------------------------ */
async function tagCategoryRoutes(fastify, opts) {

    fastify.addHook('preHandler', OnlyLoginUserMiddleware());
    fastify.get("/", AsyncHandler(listTagCategories));
    fastify.get("/detail/:tagCategoryId", AsyncHandler(getTagCategoryDetails));
    fastify.get("/show/:tagCategoryId", AsyncHandler(getTagCategoryDetails));
    fastify.post("/",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(["tag-category-manage"])
        }, AsyncHandler(createNewTagCategory));

    fastify.patch("/:tagCategoryId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(["tag-category-manage"])
        }, AsyncHandler(updateTagCategoryInfo));

    fastify.delete("/:tagCategoryId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(["tag-category-manage"])
        }, AsyncHandler(permanentlyDeleteTagCategory));
}

module.exports = tagCategoryRoutes;