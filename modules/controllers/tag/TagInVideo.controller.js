const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const TagInVideoResponse = require("../../dto/tag/TagInVideo.response");
const TagInVideoService = require("../../services/tag/TagInVideo.service")


async function getTagsInVideo(req, res) {
    const {
        categoryId = null,
        search,
        type = null,
        page = 1,
        take = 10
    } = getDataFromReqQuery(req);

    const tags = await TagInVideoService.getTags({ search, categoryId, type, page, take, shotUsageCount: true });

    return BaseController.ok(res, { tags: TagInVideoResponse.create(tags.rows), count: tags.count });
}

async function getShots(req, res) {
    const { tagId } = req.params

    const query = getDataFromReqQuery(req);
    const tag = await TagInVideoService.getShotsOfTag(tagId, query);
    return BaseController.ok(res, tag);

}


async function detachShotFromTag(req, res) {
    const { tagId, shotId } = req.params
    await TagInVideoService.detachShotFromTag(tagId, shotId, { inVideo: 1 })
    return BaseController.ok(res);
}

async function deleteTag(req, res) {
    const { tagId } = req.params
    await TagInVideoService.deleteTag(tagId)
    return BaseController.ok(res);
}



module.exports = {
    getTagsInVideo,
    getShots,
    detachShotFromTag,
    deleteTag
};