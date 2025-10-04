const ResponseDTO = require("../../_default/Response.dto");
const TagInVideoResponse = require("../../dto/tag/TagInVideo.response");
const TagInVideoService = require("../../services/tag/TagInVideo.service")


async function getTagsInVideo(req, res) {

    const tags = await TagInVideoService.getTags({  shotUsageCount: true, ...req.query });

    return ResponseDTO.success(res, { tags: TagInVideoResponse.create(tags.rows), count: tags.count });
}

async function getShots(req, res) {
    const { tagId } = req.params

    const tag = await TagInVideoService.getShotsOfTag(tagId, req.query);
    return ResponseDTO.success(res, tag);

}


async function detachShotFromTag(req, res) {
    const { tagId, shotId } = req.params
    await TagInVideoService.detachShotFromTag(tagId, shotId, { inVideo: 1 })
    return ResponseDTO.success(res);
}

async function deleteTag(req, res) {
    const { tagId } = req.params
    await TagInVideoService.deleteTag(tagId)
    return ResponseDTO.success(res);
}



module.exports = {
    getTagsInVideo,
    getShots,
    detachShotFromTag,
    deleteTag
};