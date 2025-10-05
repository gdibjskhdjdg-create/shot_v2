const ResponseDTO = require("../../_default/Response.dto");
const TagResponse = require("../../dto/tag/Tag.response");
const TagCategoryService = require("../../services/tag/TagCategory.service");
const TagCategoryValidation = require("../../validation/tag/TagCategory.validation");

async function fetchList(req, res) {
  
    const categories = await TagCategoryService.getTagCategories({
        ...req.query,
        getTags: true
    });

    return ResponseDTO.success(res, { categories: categories.rows, count: categories.count });
}

async function findTag(req, res) {
  

    const tags = await TagCategoryService.getTagCategories(req.query);

    return ResponseDTO.success(res, { tags: TagResponse.create(tags.rows), count: tags.count });
}

async function displayCategory(req, res) {
    const { tagCategoryId } = req.params;

    const category = await TagCategoryService.showCategory(tagCategoryId);

    return ResponseDTO.success(res, category);
}

async function fetchDetail(req, res) {
    const { tagId } = req.params;

    const tag = await TagCategoryService.getTagDetail(tagId);

    return ResponseDTO.success(res, tag);
}

async function addTagCategory(req, res) {
    const body = req.body;

    const data = TagCategoryValidation.createTagCategory(body);
    const category = await TagCategoryService.createCategory(data)
    return ResponseDTO.success(res, { tagCategoryId: category.id });
}

async function modifyTagCategory(req, res) {
    const body = req.body;
    const { tagCategoryId } = req.params;

    const data = TagCategoryValidation.createTagCategory(body);
    const tag = await TagCategoryService.editCategory(tagCategoryId, data);
    return ResponseDTO.success(res);
}

async function removeTagCategory(req, res) {
    const { tagCategoryId } = req.params;

    await TagCategoryService.deleteCategory(tagCategoryId);
    return ResponseDTO.success(res);
}


module.exports = {
    fetchList,
    findTag,
    displayCategory,
    fetchDetail,
    addTagCategory,
    modifyTagCategory,
    removeTagCategory
};