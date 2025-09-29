const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const Tag_DTO = require("../../dto/tag/Tag.dto");
const TagService = require("../../services/tag/Tag.service");
const TagValidation = require("../../validation/tag/Tag.validation");

class TagController {
    async getList(req, res) {
        const {
            categoryId = null,
            search,
            type = null,
            excludeId = null,
            page = 1,
            take = 10,
            sortKey = "createdAt",
            sortACS = "DESC",
        } = getDataFromReqQuery(req);

        const tags = await TagService.getTags({ search, categoryId, excludeId, type, page, take, shotUsageCount: true, sortKey, sortACS });
        return BaseController.ok(res, { tags: Tag_DTO.create(tags.rows), count: tags.count });
    }


    async searchTag(req, res) {
        const {
            search,
            excludeId = null,
            type = null,
            page = 1,
            take = 10
        } = getDataFromReqQuery(req);
        const tags = await TagService.getTags({ search, excludeId, type, page, take });
        return BaseController.ok(res, { tags: Tag_DTO.create(tags.rows), count: tags.count });
    }

    async getDetail(req, res) {
        const { tagId } = req.params;
        const tag = await TagService.getTagDetail(tagId);
        return BaseController.ok(res, tag);
    }

    async getShots(req, res) {
        const { tagId } = req.params;
        const query = getDataFromReqQuery(req);
        const tag = await TagService.getShotsOfTag(tagId, query);
        return BaseController.ok(res, tag);
    }

    async createTag(req, res) {
        const body = req.body;
        const data = TagValidation.createTag(body);
        const tag = await TagService.createTag(data);
        return BaseController.ok(res, Tag_DTO.create(tag));
    }

    async mergeTag(req, res) {
        const { sourceTagId, targetTagId } = req.params
        const hasAffected = await TagService.mergeTag(sourceTagId, targetTagId)
        return BaseController.ok(res, {hasAffected});

    }

    async editTag(req, res) {
        const body = req.body;
        const { tagId } = req.params;
        const data = TagValidation.createTag(body);
        const tag = await TagService.editTag(tagId, data);
        return BaseController.ok(res, Tag_DTO.create(tag));

    }

    async detachShotFromTag(req, res) {
        const { tagId, shotId } = req.params
        await TagService.detachShotFromTag(tagId, shotId)
        return BaseController.ok(res);
    }


    async deleteTag(req, res) {
        const { tagId } = req.params
        await TagService.deleteTag(tagId)
        return BaseController.ok(res);
    }
}

module.exports = new TagController();