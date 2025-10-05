const ResponseDTO = require("../../_default/Response.dto");
const TagInVideoResponse = require("../../dto/tag/TagInVideo.response");
const TagInVideoService = require("../../services/tag/TagInVideo.service")


async function fetchTagsInVideo(req, res) {

    const tags = await TagInVideoService.getTags({  shotUsageCount: true, ...req.query });

    return ResponseDTO.success(res, { tags: TagInVideoResponse.create(tags.rows), count: tags.count });
}

async function fetchShots(req, res) {
    const { tagId } = req.params

    const tag = await TagInVideoService.getShotsOfTag(tagId, req.query);
    return ResponseDTO.success(res, tag);

}


async function disconnectShotFromTag(req, res) {
    const { tagId, shotId } = req.params
    await TagInVideoService.detachShotFromTag(tagId, shotId, { inVideo: 1 })
    return ResponseDTO.success(res);
}

async function removeTag(req, res) {
    const { tagId } = req.params
    await TagInVideoService.deleteTag(tagId)
    return ResponseDTO.success(res);
}



module.exports = {
    fetchTagsInVideo,
    fetchShots,
    disconnectShotFromTag,
    removeTag
};