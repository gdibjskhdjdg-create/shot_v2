const ResponseDTO = require("../../_default/Response.dto");
const KeywordInVideoResponse = require("../../dto/keyword/KeywordInVideo.response");
const KeywordInVideoService = require("../../services/keyword/KeywordInVideo.service")


async function fetchKeywordsInVideo(req, res) {

    const keywords = await KeywordInVideoService.getKeywords({  shotUsageCount: true, ...req.query });

    return ResponseDTO.success(res, { keywords: KeywordInVideoResponse.create(keywords.rows), count: keywords.count });
}

async function fetchShots(req, res) {
    const { keywordId } = req.params

    const keyword = await KeywordInVideoService.getShotsOfKeyword(keywordId, req.query);
    return ResponseDTO.success(res, keyword);

}


async function disconnectShotFromKeyword(req, res) {
    const { keywordId, shotId } = req.params
    await KeywordInVideoService.detachShotFromKeyword(keywordId, shotId, { inVideo: 1 })
    return ResponseDTO.success(res);
}

async function removeKeyword(req, res) {
    const { keywordId } = req.params
    await KeywordInVideoService.deleteKeyword(keywordId)
    return ResponseDTO.success(res);
}



module.exports = {
    fetchKeywordsInVideo,
    fetchShots,
    disconnectShotFromKeyword,
    removeKeyword
};