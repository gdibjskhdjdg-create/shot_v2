const { getDataFromReqQuery } = require("../../../helper/general.tool");
const ResponseDTO = require("../../_default/Response.dto");
const TagResponse = require("../../dto/tag/Tag.response");
const TagService = require("../../services/tag/Tag.service");
const TagValidation = require("../../validation/tag/Tag.validation");

async function listItems(req, res) {
    const query = getDataFromReqQuery(req);
    const tags = await TagService.getTags({ ...query , shotUsageCount: true});
    return ResponseDTO.success(res, { tags: TagResponse.create(tags.rows), count: tags.count });
}


async function suggestions(req, res) {
    const query = getDataFromReqQuery(req);
    const tags = await TagService.getTags({ ...query });
    return ResponseDTO.success(res, { tags: TagResponse.create(tags.rows), count: tags.count });
}

async function show(req, res) {
    const { tagId } = req.params;
    const tag = await TagService.getTagDetail(tagId);
    return ResponseDTO.success(res, tag);
}

async function shots(req, res) {
    const { tagId } = req.params;
    const query = getDataFromReqQuery(req);
    const tag = await TagService.getShotsOfTag(tagId, query);
    return ResponseDTO.success(res, tag);
}

async function newItem(req, res) {
    const body = req.body;
    const data = TagValidation.createTag(body);
    const tag = await TagService.createTag(data);
    return ResponseDTO.success(res, TagResponse.create(tag));
}

async function combine(req, res) {
    const { sourceTagId, targetTagId } = req.params
    const hasAffected = await TagService.mergeTag(sourceTagId, targetTagId)
    return ResponseDTO.success(res, { hasAffected });

}

async function update(req, res) {
    const body = req.body;
    const { tagId } = req.params;
    const data = TagValidation.createTag(body);
    const tag = await TagService.editTag(tagId, data);
    return ResponseDTO.success(res, TagResponse.create(tag));

}

async function removeShot(req, res) {
    const { tagId, shotId } = req.params
    await TagService.detachShotFromTag(tagId, shotId)
    return ResponseDTO.success(res);
}


async function destroy(req, res) {
    const { tagId } = req.params
    await TagService.deleteTag(tagId)
    return ResponseDTO.success(res);
}


module.exports = {
    listItems,
    suggestions,
    show,
    shots,
    newItem,
    combine,
    update,
    removeShot,
    destroy
}