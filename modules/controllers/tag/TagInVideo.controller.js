
const { getDataFromReqQuery } = require("../../../helper/general.tool");
const { ok } = require("../../_default/controller/Base.controller");
const TagInVideoDTO = require("../../dto/tag/TagInVideo.dto");
const TagInVideoService = require("../../services/tag/TagInVideo.service");

const listTagsInVideo = async (req, res) => {
    const query = getDataFromReqQuery(req);
    const tags = await TagInVideoService.get({ ...query, shotUsageCount: true });
    return ok(res, { tags: TagInVideoDTO.create(tags.rows), count: tags.count });
};

const getShotsForTagInVideo = async (req, res) => {
    const { tagId } = req.params;
    const query = getDataFromReqQuery(req);
    const tag = await TagInVideoService.getShots(tagId, query);
    return ok(res, tag);
};

const removeShotFromTagInVideo = async (req, res) => {
    const { tagId, shotId } = req.params;
    await TagInVideoService.detachShot(tagId, shotId);
    return ok(res);
};

const permanentlyDeleteTagInVideo = async (req, res) => {
    const { tagId } = req.params;
    await TagInVideoService.deleteOne(tagId);
    return ok(res);
};

module.exports = {
    listTagsInVideo,
    getShotsForTagInVideo,
    removeShotFromTagInVideo,
    permanentlyDeleteTagInVideo,
};