const ResponseDTO = require("../../_default/Response.dto");

const { getDataFromReqQuery } = require("../../../helper/general.tool");
const { equalizerService } = require("../../services/shotList/index");
const ErrorResult = require("../../../helper/error.tool");


async function getVideoFileOfPathForEqualizer(req, res) {
    const { projectId } = req.params;
    const { reqPath } = req.body;

    const filters = {
        projectId,
        reqPath,
    }

    const videoFiles = await equalizerService.getVideoFilesOfProjectPath(filters);

    return ResponseDTO.success(res, videoFiles);
}

async function getEqualizeList(req, res) {
    const validKey = ["page", "take", "userId", "videoFileId", "projectId", "status"];
    const filters = getDataFromReqQuery(req, validKey);
    const user = req.user;

    // if(user.permission !== "admin"){
    //     filters.userId = user.id;
    // }

    const videoFiles = await equalizerService.getEqualizeList({
        page: 1,
        take: 10,
        ...filters
    });

    return ResponseDTO.success(res, videoFiles);
}

async function getEqualizeCompare(req, res) {
    const { equalizeId } = req.params;

    const response = await equalizerService.getCompare(equalizeId);
    return ResponseDTO.success(res, response);
}

async function startEqualizeProcess(req, res) {
    const { shotId } = req.params;
    const { user } = req;

    await equalizerService.startEqualize(shotId, user.id);
    return ResponseDTO.success(res);
}

async function submitStatusEqualizerShot(req, res) {
    const { shotId } = req.params;
    const { user } = req;
    const { status, description, newData, oldData } = req.body;

    await equalizerService.submitStatusEqualizeShot(shotId, user.id, { status, description, newData, oldData })
    return ResponseDTO.success(res)
}

async function getReports(req, res) {
    const queries = getDataFromReqQuery(req);

    if (!queries.userId) {
        throw ErrorResult.badRequest(null, "userId is required");
    }

    let response = await equalizerService.getEqualizeReport(queries);

    return ResponseDTO.success(res, response)
}

module.exports = {
    getVideoFileOfPathForEqualizer,
    getEqualizeList,
    getEqualizeCompare,
    startEqualizeProcess,
    submitStatusEqualizerShot,
    getReports

};