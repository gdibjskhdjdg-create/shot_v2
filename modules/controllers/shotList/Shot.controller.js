const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const ShotList_DTO = require("../../dto/shotList/ShotList.dto");
const ShotListQuery_DTO = require("../../dto/shotList/ShotListQuery.dto");
const { shotService, shotExportService } = require("../../services/shotList/index");
const shotValidation = require("../../validation/shotList/shot.validation");
const ShotImportFileService = require('../../services/shotList/ShotImportFile.service');
const ErrorResult = require('../../../helper/error.tool');

class ShotController {

    async getBasicInfo(req, res) {
        const response = await shotService.getBasicInfoForShot();
        return BaseController.ok(res, response);
    }

    async getExportInfoShots(req, res) {
        const query = getDataFromReqQuery(req);
        const { shots, isExcludeMode, ...filters } = query
        const info = await shotService.getExportInfoShots({ shots, isExcludeMode, filters })
        return BaseController.ok(res, info)
    }

    async getShotList(req, res) {

        const { status } = req.params;

        if (status && !['init-check', 'equalizing', 'equalized'].includes(status)) {
            throw ErrorResult.notFound()
        }

        const query = getDataFromReqQuery(req);
        const filters = ShotListQuery_DTO.create({
            page: 1, take: 10, ...query
        });

        filters.status = status == 'equalized' ? ['equalize_confirm', 'equalize_confirm_edit', 'equalize_need_meeting'] : status

        const user = req.user;
        if (
            user.permission !== 'admin' && 
            !user.access.includes("shot-full-access") &&
            !user.access.includes("shot-list")
        ) {
            filters.userId = user.id;
        }

        const { shots, count } = await shotService.shotList(filters);

        return BaseController.ok(res, { shots: ShotList_DTO.create(shots), count });
    }

    async getMeetingShotList(req, res) {
        const query = getDataFromReqQuery(req);
        const filters = ShotListQuery_DTO.create({
            page: 1, take: 10, ...query
        });

        filters.status = 'equalize_need_meeting'

        const user = req.user;
        if (user.permission !== 'admin' && !user.access.includes("shot-full-access")) {
            filters.userId = user.id;
        }

        const { shots, count } = await shotService.shotList(filters);

        return BaseController.ok(res, { shots: ShotList_DTO.create(shots), count });
    }

    async getShotListSpecial(req, res) {
        const query = getDataFromReqQuery(req);
        const filters = {
            page: 1,
            take: 10,
            ...query
        };

        const user = req.user;
        if (
            user.permission !== 'admin' && 
            !user.access.includes("shot-full-access") &&
            !user.access.includes("shot-list")
        ) {
            filters.userId = user.id;
        }

        const { shots, count } = await shotService.specialShotList(filters);

        return BaseController.ok(res, { shots: ShotList_DTO.create(shots), count });
    }

    async getShotDetail(req, res) {
        const { id } = req.params;

        const response = await shotService.detail(id);
        return BaseController.ok(res, response);
    }

    async updateInitShot(req, res) {
        const body = req.body;
        const { id } = req.params;
        const userId = req.user.id

        const validData = await shotValidation.updateShot(body);
        const response = await shotService.updateInitShot(id, userId, validData);
        return BaseController.ok(res, response)
    }

    async updateEditorShot(req, res) {
        const body = req.body;
        const { id } = req.params;
        const userId = req.user.id

        const validData = await shotValidation.updateShot(body);
        const response = await shotService.updateEditorShot(id, userId, validData);
        return BaseController.ok(res, response)
    }

    async updateEqualizingShot(req, res) {
        const body = req.body;
        const { id } = req.params;
        const userId = req.user.id

        const validData = await shotValidation.updateShot(body);
        const response = await shotService.updateEqualizingShot(id, userId, validData);
        return BaseController.ok(res, response)
    }

    async updateNeedMeetingShot(req, res) {
        const body = req.body;
        const { id } = req.params;
        const userId = req.user.id

        const validData = await shotValidation.updateShot(body);
        const response = await shotService.updateEqualizingShot(id, userId, validData);
        return BaseController.ok(res, response)
    }

    async updateShot(req, res) {
        const body = req.body;
        const { id, status } = req.params;
        const userId = req.user.id;

        const validData = await shotValidation.updateShot(body);
        const response = await shotService.updateShot(id, userId, validData);
        return BaseController.ok(res, response)
    }

    async updateShotStatus(req, res) {
        const { status } = req.body;
        const id = req.params.id;
        const userId = req.user.id

        if (status && !['init-check', 'equalize_confirm', 'equalize_confirm_edit', 'equalize_need_meeting'].includes(status)) {
            throw ErrorResult.badRequest("status is invalid")
        }

        await shotService.updateStatus(id, status)
        return BaseController.ok(res)

    }

    async deleteShot(req, res) {
        const id = req.params.id;

        const response = await shotService.deleteShot(id);
        return BaseController.ok(res, response)
    }

    async deleteShotOfProject(req, res) {
        const { projectId } = req.params;

        const response = await shotService.deleteShotsOfProject(projectId);
        return BaseController.ok(res, response)
    }

    async deleteShotsOfVideoFile(req, res) {
        const { videoFileId } = req.params;

        const response = await shotService.deleteShotsOfVideoFile(videoFileId);
        return BaseController.ok(res, response)
    }

    async createInitShot(req, res) {
        const { videoFileId } = req.params;
        const body = req.body;

        const userId = req.user.id;

        const validData = await shotValidation.updateShot(body);
        const response = await shotService.createInitShotForVideoFile(videoFileId, userId, validData);

        return BaseController.ok(res, response);
    }

    async createEditorShot(req, res) {
        const { videoFileId } = req.params;
        const body = req.body;

        const userId = req.user.id;

        const validData = await shotValidation.updateShot(body);
        const response = await shotService.createEditorShotForVideoFile(videoFileId, userId, validData);

        return BaseController.ok(res, response);
    }

    async createEqualizingShot(req, res) {
        const { videoFileId } = req.params;
        const body = req.body;

        const userId = req.user.id;

        const validData = await shotValidation.updateShot(body);
        const response = await shotService.createEditorShotForVideoFile(videoFileId, userId, validData);

        return BaseController.ok(res, response);
    }

    // ====shots of video =====================================
    async getShotOfVideoFile(req, res) {
        const { videoFileId } = req.params
        const query = getDataFromReqQuery(req);
        const response = await shotService.getSections_Service(videoFileId, query);
        return BaseController.ok(res, response);
    }

    async getInitShotOfVideoFile(req, res) {
        const { videoFileId } = req.params;

        const filters = {}
        filters.shotStatus = ['init-check', 'editor'];

        const videoFiles = await shotService.getSections_Service(videoFileId, filters);

        return BaseController.ok(res, videoFiles)
    }

    async getEditorShotOfVideoFile(req, res) {
        const { videoFileId } = req.params;

        const filters = {};
        filters.shotStatus = ['editor', 'equalizing'];

        const videoFiles = await shotService.getSections_Service(videoFileId, filters);

        return BaseController.ok(res, videoFiles)
    }

    async getEqualizingShotOfVideoFile(req, res) {
        const { videoFileId } = req.params;

        const filters = {}
        filters.shotStatus = ['equalizing', 'equalize_confirm', 'equalize_confirm_edit', 'equalize_need_meeting']

        const videoFiles = await shotService.getSections_Service(videoFileId, filters);

        return BaseController.ok(res, videoFiles)
    }

    async exportShotListSpecial(req, res) {
        const { exportType } = req.params;

        const query = getDataFromReqQuery(req);
        const filters = {
            page: 1,
            excludesId: null,
            ...query
        };

        const user = req.user;
        if (user.permission !== 'admin' && !user.access.includes("shot-full-access")) {
            filters.userId = user.id;
        }

        const response = await shotExportService.exportSpecialShot(exportType, filters)

        return BaseController.ok(res, response);
    }

    async getExportShotsId(req, res) {
        const query = getDataFromReqQuery(req);
        const { shots, isExcludeMode, ...filters } = query
        const shotsId = await shotExportService.getExportShotsId(shots, isExcludeMode, filters)
        return BaseController.ok(res, shotsId)
    }

    async exportShots(req, res) {
        const { exportType } = req.params;
        const query = getDataFromReqQuery(req);

        const validData = shotValidation.exportShots(query.shotsId);
        const response = await shotExportService.exportShot(exportType, validData.shotsId)

        return BaseController.ok(res, response);
    }

    async exportShotsOfProject(req , res){
        const { exportType, projectId } = req.params;

        // const query = getDataFromReqQuery(req);

        // const validData = shotValidation.exportShots(query.shotsId);
        const response = await shotExportService.exportShotsOfProject(exportType, projectId)

        return BaseController.ok(res, response);
    }

    async exportShotsOfVideo(req, res) {
        const { exportType, videoFileId } = req.params;

        // const query = getDataFromReqQuery(req);

        // const validData = shotValidation.exportShots(query.shotsId);
        const response = await shotExportService.exportShotsOfVideo(exportType, videoFileId)

        return BaseController.ok(res, response);
    }

    async exportExcel(req, res) {
        const { exportType, shotId } = req.params;
        const shots = await shotExportService.exportShot(exportType, [shotId])
        return BaseController.ok(res, shots)
    }

    async uploadExcel(req, res) {
        await ShotImportFileService.storeExcelFile(req);
        return BaseController.ok(res, {});
    }
}

module.exports = new ShotController();