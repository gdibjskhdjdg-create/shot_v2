const ResponseDTO = require("../../_default/Response.dto");
const KeywordResponse = require("../../dto/keyword/Keyword.response");
const KeywordService = require("../../services/keyword/Keyword.service");
const KeywordValidation = require("../../validation/keyword/Keyword.validation");

async function list(req, res) {
    const tags = await KeywordService.getTags({ ...req.query , shotUsageCount: true});
    return ResponseDTO.success(res, { tags: KeywordResponse.create(tags.rows), count: tags.count });
}


async function suggestions(req, res) {
    const tags = await KeywordService.getTags({ ...req.query });
    return ResponseDTO.success(res, { tags: KeywordResponse.create(tags.rows), count: tags.count });
}

async function show(req, res) {
    const { keywordId } = req.params;
    const tag = await KeywordService.getTagDetail(keywordId);
    return ResponseDTO.success(res, tag);
}

async function shots(req, res) {
    const { keywordId } = req.params;
    const tag = await KeywordService.getShotsOfTag(keywordId, req.query);
    return ResponseDTO.success(res, tag);
}

async function newItem(req, res) {
    const body = req.body;
    const data = KeywordValidation.createTag(body);
    const tag = await KeywordService.createTag(data);
    return ResponseDTO.success(res, KeywordResponse.create(tag));
}

async function combine(req, res) {
    const { sourceKeywordId, targetKeywordId } = req.params
    const hasAffected = await KeywordService.mergeTag(sourceKeywordId, targetKeywordId)
    return ResponseDTO.success(res, { hasAffected });

}

async function update(req, res) {
    const body = req.body;
    const { keywordId } = req.params;
    const data = KeywordValidation.createTag(body);
    const tag = await KeywordService.editTag(keywordId, data);
    return ResponseDTO.success(res, KeywordResponse.create(tag));

}

async function removeShot(req, res) {
    const { keywordId, shotId } = req.params
    await KeywordService.detachShotFromTag(keywordId, shotId)
    return ResponseDTO.success(res);
}


async function destroy(req, res) {
    const { keywordId } = req.params
    await KeywordService.deleteTag(keywordId)
    return ResponseDTO.success(res);
}


module.exports = {
    list,
    suggestions,
    show,
    shots,
    newItem,
    combine,
    update,
    removeShot,
    destroy
}