const { getDataFromReqQuery } = require("../../../helper/general.tool");
const ResponseDTO = require("../../_default/Response.dto");
const TagResponse = require("../../dto/tag/Tag.response");
const TagCategoryService = require("../../services/tag/TagCategory.service");
const TagCategoryValidation = require("../../validation/tag/TagCategory.validation");

async function getList(req, res) {
    const {
        search,
        type = null,
        page = 1,
        take = 10
    } = getDataFromReqQuery(req);

    const categories = await TagCategoryService.getTagCategories({
        search,
        type,
        page,
        take,
        getTags: true
    });

    return ResponseDTO.success(res, { categories: categories.rows, count: categories.count });
}

async function searchTag(req, res) {
    const {
        search,
        type = null,
        page = 1,
        take = 10
    } = getDataFromReqQuery(req);

    const tags = await TagCategoryService.getTagCategories({ search, type, page, take });

    return ResponseDTO.success(res, { tags: TagResponse.create(tags.rows), count: tags.count });
}

async function showCategory(req, res) {
    const { tagCategoryId } = req.params;

    const category = await TagCategoryService.showCategory(tagCategoryId);

    return ResponseDTO.success(res, category);
}

async function getDetail(req, res) {
    const { tagId } = req.params;

    const tag = await TagCategoryService.getTagDetail(tagId);

    return ResponseDTO.success(res, tag);
}

async function createTagCategory(req, res) {
    const body = req.body;

    const data = TagCategoryValidation.createTagCategory(body);
    const category = await TagCategoryService.createCategory(data)
    return ResponseDTO.success(res, { tagCategoryId: category.id });
}

async function editTagCategory(req, res) {
    const body = req.body;
    const { tagCategoryId } = req.params;

    const data = TagCategoryValidation.createTagCategory(body);
    const tag = await TagCategoryService.editCategory(tagCategoryId, data);
    return ResponseDTO.success(res);
}

async function deleteTagCategory(req, res) {
    const { tagCategoryId } = req.params;

    await TagCategoryService.deleteCategory(tagCategoryId);
    return ResponseDTO.success(res);
}


module.exports = {
    getList,
    searchTag,
    showCategory,
    getDetail,
    createTagCategory,
    editTagCategory,
    deleteTagCategory
};