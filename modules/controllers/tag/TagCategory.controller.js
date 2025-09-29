const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const Tag_DTO = require("../../dto/tag/Tag.dto");
const TagCategoryService = require("../../services/tag/TagCategory.service");
const TagCategoryValidation = require("../../validation/tag/TagCategory.validation");



class TagCategory_Controller {

    async getList(req, res) {
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

    async searchTag(req, res) {
        const {
            search,
            type = null,
            page = 1,
            take = 10
        } = getDataFromReqQuery(req);

        const tags = await TagCategoryService.getTagCategories({ search, type, page, take });

        return BaseController.ok(res, { tags: Tag_DTO.create(tags.rows), count: tags.count });
    }

    async showCategory(req, res) {
        const { tagCategoryId } = req.params;

        const category = await TagCategoryService.showCategory(tagCategoryId);

        return BaseController.ok(res, category);
    }

    async getDetail(req, res) {
        const { tagId } = req.params;

        const tag = await TagCategoryService.getTagDetail(tagId);

        return BaseController.ok(res, tag);
    }

    async createTagCategory(req, res) {
        const body = req.body;

        const data = TagCategoryValidation.createTagCategory(body);
        const category = await TagCategoryService.createCategory(data)
        return BaseController.ok(res, { tagCategoryId: category.id });
    }

    async editTagCategory(req, res) {
        const body = req.body;
        const { tagCategoryId } = req.params;

        const data = TagCategoryValidation.createTagCategory(body);
        const tag = await TagCategoryService.editCategory(tagCategoryId, data);
        return BaseController.ok(res);
    }

    async deleteTagCategory(req, res) {
        const { tagCategoryId } = req.params;

        await TagCategoryService.deleteCategory(tagCategoryId);
        return BaseController.ok(res);
    }
}

module.exports = new TagCategory_Controller();