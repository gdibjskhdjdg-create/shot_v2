const BaseController = require("../../_default/controller/Base.controller");
const { getDataFromReqQuery } = require("../../../helper/general.tool");
const { equalizerService } = require("../../services/shotList/index");
const ErrorResult = require("../../../helper/error.tool");

const listVideoFilesForEqualizer = async (req, res) => {
    const { projectId } = req.params;
    const { reqPath } = req.body;
    const filters = { projectId, reqPath };

    const videoFiles = await equalizerService.getVideoFilesOfProjectPath(filters);
    return BaseController.ok(res, videoFiles);
};

const listEqualizerTasks = async (req, res) => {
    const validKeys = ["page", "take", "userId", "videoFileId", "projectId", "status"];
    const queryFilters = getDataFromReqQuery(req, validKeys);
    const filters = { page: 1, take: 10, ...queryFilters };

    const videoFiles = await equalizerService.getEqualizeList(filters);
    return BaseController.ok(res, videoFiles);
};

const getEqualizerComparison = async (req, res) => {
    const { equalizeId } = req.params;
    const response = await equalizerService.getCompare(equalizeId);
    return BaseController.ok(res, response);
};

const startEqualizerProcess = async (req, res) => {
    const { shotId } = req.params;
    const { user } = req;
    await equalizerService.startEqualize(shotId, user.id);
    return BaseController.ok(res);
};

const submitEqualizerStatus = async (req, res) => {
    const { shotId } = req.params;
    const { user } = req;
    const { status, description, newData, oldData } = req.body;

    await equalizerService.submitStatusEqualizeShot(shotId, user.id, { status, description, newData, oldData });
    return BaseController.ok(res);
};

const getEqualizerReports = async (req, res) => {
    const queries = getDataFromReqQuery(req);
    if (!queries.userId) {
        throw ErrorResult.badRequest("userId is required");
    }
    const response = await equalizerService.getEqualizeReport(queries);
    return BaseController.ok(res, response);
};

module.exports = {
    listVideoFilesForEqualizer,
    listEqualizerTasks,
    getEqualizerComparison,
    startEqualizerProcess,
    submitEqualizerStatus,
    getEqualizerReports,
};
