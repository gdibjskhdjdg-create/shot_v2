const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
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

    return BaseController.ok(res, { categories: categories.rows, count: categories.count });
}

async function searchTag(req, res) {
    const {
        search,
        type = null,
        page = 1,
        take = 10
    } = getDataFromReqQuery(req);

    const tags = await TagCategoryService.getTagCategories({ search, type, page, take });

    return BaseController.ok(res, { tags: TagResponse.create(tags.rows), count: tags.count });
}

async function showCategory(req, res) {
    const { tagCategoryId } = req.params;

    const category = await TagCategoryService.showCategory(tagCategoryId);

    return BaseController.ok(res, category);
}

async function getDetail(req, res) {
    const { tagId } = req.params;

    const tag = await TagCategoryService.getTagDetail(tagId);

    return BaseController.ok(res, tag);
}

async function createTagCategory(req, res) {
    const body = req.body;

    const data = TagCategoryValidation.createTagCategory(body);
    const category = await TagCategoryService.createCategory(data)
    return BaseController.ok(res, { tagCategoryId: category.id });
}

async function editTagCategory(req, res) {
    const body = req.body;
    const { tagCategoryId } = req.params;

    const data = TagCategoryValidation.createTagCategory(body);
    const tag = await TagCategoryService.editCategory(tagCategoryId, data);
    return BaseController.ok(res);
}

async function deleteTagCategory(req, res) {
    const { tagCategoryId } = req.params;

    await TagCategoryService.deleteCategory(tagCategoryId);
    return BaseController.ok(res);
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