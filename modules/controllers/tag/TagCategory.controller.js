
const { getDataFromReqQuery } = require("../../../helper/general.tool");
const { ok } = require("../../_default/controller/Base.controller");
const TagCategoryService = require("../../services/tag/TagCategory.service");
const TagCategoryValidation = require("../../validation/tag/TagCategory.validation");
const Tag_DTO = require("../../dto/tag/Tag.dto");

const listTagCategories = async (req, res) => {
    const query = getDataFromReqQuery(req);
    const categories = await TagCategoryService.getCategories(query);
    return ok(res, categories);
};

const getTagCategoryDetails = async (req, res) => {
    const { tagCategoryId } = req.params;
    const category = await TagCategoryService.showCategory(tagCategoryId);
    return ok(res, Tag_DTO.create(category));
};

const getTagDetailsInCategory = async (req, res) => {
    const { tagId } = req.params;
    const tag = await TagCategoryService.getDetail(tagId);
    return ok(res, tag);
};

const createNewTagCategory = async (req, res) => {
    const body = req.body;
    const data = TagCategoryValidation.createTagCategory(body);
    const category = await TagCategoryService.createCategory(data);
    return ok(res, { tagCategoryId: category.id });
};

const updateTagCategoryInfo = async (req, res) => {
    const body = req.body;
    const { tagCategoryId } = req.params;
    const data = TagCategoryValidation.createTagCategory(body);
    await TagCategoryService.editCategory(tagCategoryId, data);
    return ok(res);
};

const permanentlyDeleteTagCategory = async (req, res) => {
    const { tagCategoryId } = req.params;
    await TagCategoryService.deleteCategory(tagCategoryId);
    return ok(res);
};

module.exports = {
    listTagCategories,
    getTagCategoryDetails,
    getTagDetailsInCategory,
    createNewTagCategory,
    updateTagCategoryInfo,
    permanentlyDeleteTagCategory,
};