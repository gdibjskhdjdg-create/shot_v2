const ResponseDTO = require("../../_default/Response.dto");
const KeywordResponse = require("../../dto/keyword/Keyword.response");
const KeywordService = require("../../services/keyword/Keyword.service");
const KeywordValidation = require("../../validation/keyword/Keyword.validation");

async function list(req, res) {
    const keywords = await KeywordService.getKeywords({ ...req.query , shotUsageCount: true});
    return ResponseDTO.success(res, { keywords: KeywordResponse.create(keywords.rows), count: keywords.count });
}


async function suggestions(req, res) {
    const keywords = await KeywordService.getKeywords({ ...req.query });
    return ResponseDTO.success(res, { keywords: KeywordResponse.create(keywords.rows), count: keywords.count });
}

async function show(req, res) {
    const { keywordId } = req.params;
    const keyword = await KeywordService.getKeywordDetail(keywordId);
    return ResponseDTO.success(res, keyword);
}

async function shots(req, res) {
    const { keywordId } = req.params;
    const keyword = await KeywordService.getShotsOfKeyword(keywordId, req.query);
    return ResponseDTO.success(res, keyword);
}

async function newItem(req, res) {
    const body = req.body;
    const data = KeywordValidation.createKeyword(body);
    const keyword = await KeywordService.createKeyword(data);
    return ResponseDTO.success(res, KeywordResponse.create(keyword));
}

async function combine(req, res) {
    const { sourceKeywordId, targetKeywordId } = req.params
    const hasAffected = await KeywordService.mergeKeyword(sourceKeywordId, targetKeywordId)
    return ResponseDTO.success(res, { hasAffected });

}

async function update(req, res) {
    const body = req.body;
    const { keywordId } = req.params;
    const data = KeywordValidation.createKeyword(body);
    const keyword = await KeywordService.editKeyword(keywordId, data);
    return ResponseDTO.success(res, KeywordResponse.create(keyword));

}

async function removeShot(req, res) {
    const { keywordId, shotId } = req.params
    await KeywordService.detachShotFromKeyword(keywordId, shotId)
    return ResponseDTO.success(res);
}


async function destroy(req, res) {
    const { keywordId } = req.params
    await KeywordService.deleteKeyword(keywordId)
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