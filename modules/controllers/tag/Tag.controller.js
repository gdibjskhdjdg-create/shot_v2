const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const TagResponse = require("../../dto/tag/Tag.response");
const TagService = require("../../services/tag/Tag.service");
const TagValidation = require("../../validation/tag/Tag.validation");

async function listItems(req, res) {
    const query = getDataFromReqQuery(req);
    const tags = await TagService.getTags({ ...query , shotUsageCount: true});
    return BaseController.ok(res, { tags: TagResponse.create(tags.rows), count: tags.count });
}


async function suggestions(req, res) {
    const query = getDataFromReqQuery(req);
    const tags = await TagService.getTags({ ...query });
    return BaseController.ok(res, { tags: TagResponse.create(tags.rows), count: tags.count });
}

async function show(req, res) {
    const { tagId } = req.params;
    const tag = await TagService.getTagDetail(tagId);
    return BaseController.ok(res, tag);
}

async function shots(req, res) {
    const { tagId } = req.params;
    const query = getDataFromReqQuery(req);
    const tag = await TagService.getShotsOfTag(tagId, query);
    return BaseController.ok(res, tag);
}

async function newItem(req, res) {
    const body = req.body;
    const data = TagValidation.createTag(body);
    const tag = await TagService.createTag(data);
    return BaseController.ok(res, TagResponse.create(tag));
}

async function combine(req, res) {
    const { sourceTagId, targetTagId } = req.params
    const hasAffected = await TagService.mergeTag(sourceTagId, targetTagId)
    return BaseController.ok(res, { hasAffected });

}

async function update(req, res) {
    const body = req.body;
    const { tagId } = req.params;
    const data = TagValidation.createTag(body);
    const tag = await TagService.editTag(tagId, data);
    return BaseController.ok(res, TagResponse.create(tag));

}

async function removeShot(req, res) {
    const { tagId, shotId } = req.params
    await TagService.detachShotFromTag(tagId, shotId)
    return BaseController.ok(res);
}


async function destroy(req, res) {
    const { tagId } = req.params
    await TagService.deleteTag(tagId)
    return BaseController.ok(res);
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