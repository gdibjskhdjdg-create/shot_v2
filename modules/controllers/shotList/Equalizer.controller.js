const BaseController = require("../../_default/controller/Base.controller");

const { getDataFromReqQuery } = require("../../../helper/general.tool");
const { equalizerService } = require("../../services/shotList/index");
const ErrorResult = require("../../../helper/error.tool");

class EqualizerController {

    async getVideoFileOfPathForEqualizer(req, res) {
        const { projectId } = req.params;
        const { reqPath } = req.body;

        const filters = {
            projectId,
            reqPath,
        }

        const videoFiles = await equalizerService.getVideoFilesOfProjectPath(filters);

        return BaseController.ok(res, videoFiles);
    }

    async getEqualizeList(req, res) {
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

        return BaseController.ok(res, videoFiles);
    }
    
    async getEqualizeCompare(req, res) {
        const { equalizeId } = req.params;

        const response = await equalizerService.getCompare(equalizeId);
        return BaseController.ok(res, response);
    }

    async startEqualizeProcess(req, res) {
        const { shotId } = req.params;
        const { user } = req;

        await equalizerService.startEqualize(shotId, user.id);
        return BaseController.ok(res);
    }

    async submitStatusEqualizerShot(req, res){
        const { shotId } = req.params;
        const { user } = req;
        const { status, description, newData, oldData } = req.body;

        await equalizerService.submitStatusEqualizeShot(shotId, user.id, { status, description, newData, oldData })
        return BaseController.ok(res)
    }

    async getReports(req, res) {
        const queries = getDataFromReqQuery(req);

        if(!queries.userId){
            throw ErrorResult.badRequest(null, "userId is required");
        }

        let response = await equalizerService.getEqualizeReport(queries);

        return BaseController.ok(res, response)
    }

}

module.exports = new EqualizerController();