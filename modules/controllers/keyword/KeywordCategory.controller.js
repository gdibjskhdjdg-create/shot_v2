const ResponseDTO = require("../../_default/Response.dto");
const KeywordResponse = require("../../dto/keyword/Keyword.response");
const KeywordCategoryService = require("../../services/keyword/KeywordCategory.service");
const KeywordCategoryValidation = require("../../validation/keyword/KeywordCategory.validation");

async function fetchList(req, res) {
  
    const categories = await KeywordCategoryService.getTagCategories({
        ...req.query,
        getTags: true
    });

    return ResponseDTO.success(res, { categories: categories.rows, count: categories.count });
}

async function findKeyword(req, res) {
  

    const tags = await KeywordCategoryService.getTagCategories(req.query);

    return ResponseDTO.success(res, { tags: KeywordResponse.create(tags.rows), count: tags.count });
}

async function displayCategory(req, res) {
    const { keywordCategoryId } = req.params;

    const category = await KeywordCategoryService.showCategory(keywordCategoryId);

    return ResponseDTO.success(res, category);
}

async function fetchDetail(req, res) {
    const { keywordCategoryId } = req.params;

    const tag = await KeywordCategoryService.getTagDetail(keywordCategoryId);

    return ResponseDTO.success(res, tag);
}

async function addKeywordCategory(req, res) {
    const body = req.body;

    const data = KeywordCategoryValidation.createTagCategory(body);
    const category = await KeywordCategoryService.createCategory(data)
    return ResponseDTO.success(res, { tagCategoryId: category.id });
}

async function modifyKeywordCategory(req, res) {
    const body = req.body;
    const { keywordCategoryId } = req.params;

    const data = KeywordCategoryValidation.createTagCategory(body);
    const tag = await KeywordCategoryService.editCategory(keywordCategoryId, data);
    return ResponseDTO.success(res);
}

async function removeKeywordCategory(req, res) {
    const { keywordCategoryId } = req.params;

    await KeywordCategoryService.deleteCategory(keywordCategoryId);
    return ResponseDTO.success(res);
}


module.exports = {
    fetchList,
    findKeyword,
    displayCategory,
    fetchDetail,
    addKeywordCategory,
    modifyKeywordCategory,
    removeKeywordCategory
};