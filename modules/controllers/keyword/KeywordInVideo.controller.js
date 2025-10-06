const ResponseDTO = require("../../_default/Response.dto");
const KeywordInVideoResponse = require("../../dto/keyword/KeywordInVideo.response");
const KeywordInVideoService = require("../../services/keyword/KeywordInVideo.service")


async function fetchKeywordsInVideo(req, res) {

    const tags = await KeywordInVideoService.getTags({  shotUsageCount: true, ...req.query });

    return ResponseDTO.success(res, { tags: KeywordInVideoResponse.create(tags.rows), count: tags.count });
}

async function fetchShots(req, res) {
    const { keywordId } = req.params

    const tag = await KeywordInVideoService.getShotsOfTag(keywordId, req.query);
    return ResponseDTO.success(res, tag);

}


async function disconnectShotFromKeyword(req, res) {
    const { keywordId, shotId } = req.params
    await KeywordInVideoService.detachShotFromTag(keywordId, shotId, { inVideo: 1 })
    return ResponseDTO.success(res);
}

async function removeKeyword(req, res) {
    const { keywordId } = req.params
    await KeywordInVideoService.deleteTag(keywordId)
    return ResponseDTO.success(res);
}



module.exports = {
    fetchKeywordsInVideo,
    fetchShots,
    disconnectShotFromKeyword,
    removeKeyword
};