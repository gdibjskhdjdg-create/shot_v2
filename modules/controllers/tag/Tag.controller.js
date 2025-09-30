
const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const Tag_DTO = require("../../dto/tag/Tag.dto");
const TagService = require("../../services/tag/Tag.service");
const TagValidation = require("../../validation/tag/Tag.validation");

const listTags = async (req, res) => {
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

const searchTags = async (req, res) => {
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

const getTagDetails = async (req, res) => {
    const { tagId } = req.params;
    const tag = await TagService.getTagDetail(tagId);
    return BaseController.ok(res, tag);
}

const getTagShots = async (req, res) => {
    const { tagId } = req.params;
    const query = getDataFromReqQuery(req);
    const tag = await TagService.getShotsOfTag(tagId, query);
    return BaseController.ok(res, tag);
}

const createNewTag = async (req, res) => {
    const body = req.body;
    const data = TagValidation.createTag(body);
    const tag = await TagService.createTag(data);
    return BaseController.ok(res, Tag_DTO.create(tag));
}

const mergeTags = async (req, res) => {
    const { sourceTagId, targetTagId } = req.params
    const hasAffected = await TagService.mergeTag(sourceTagId, targetTagId)
    return BaseController.ok(res, {hasAffected});

}

const updateTagInfo = async (req, res) => {
    const body = req.body;
    const { tagId } = req.params;
    const data = TagValidation.createTag(body);
    const tag = await TagService.editTag(tagId, data);
    return BaseController.ok(res, Tag_DTO.create(tag));

}

const removeShotFromTag = async (req, res) => {
    const { tagId, shotId } = req.params
    await TagService.detachShotFromTag(tagId, shotId)
    return BaseController.ok(res);
}

const permanentlyDeleteTag = async (req, res) => {
    const { tagId } = req.params
    await TagService.deleteTag(tagId)
    return BaseController.ok(res);
}

module.exports = {
    listTags,
    searchTags,
    getTagDetails,
    getTagShots,
    createNewTag,
    mergeTags,
    updateTagInfo,
    removeShotFromTag,
    permanentlyDeleteTag
};
