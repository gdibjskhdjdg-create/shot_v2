const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const ShotListResponse = require("../../dto/shotList/ShotList.response");
const ShotListQuery = require("../../dto/shotList/ShotList.query");
const { shotService, shotExportService } = require("../../services/shotList/index");
const shotValidation = require("../../validation/shotList/shot.validation");
const ShotImportFileService = require('../../services/shotList/ShotImportFile.service');
const ErrorResult = require('../../../helper/error.tool');

async function getBasicInfo(req, res) {
    const response = await shotService.getBasicInfoForShot();
    return BaseController.ok(res, response);
}

async function getExportInfoShots(req, res) {
    const query = getDataFromReqQuery(req);
    const { shots, isExcludeMode, ...filters } = query
    const info = await shotService.getExportInfoShots({ shots, isExcludeMode, filters })
    return BaseController.ok(res, info)
}

async function getShotList(req, res) {

    const { status } = req.params;

    if (status && !['init-check', 'equalizing', 'equalized'].includes(status)) {
        throw ErrorResult.notFound()
    }

    const query = getDataFromReqQuery(req);
    const filters = ShotListQuery.create({
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

    return BaseController.ok(res, { shots: ShotListResponse.create(shots), count });
}

async function getMeetingShotList(req, res) {
    const query = getDataFromReqQuery(req);
    const filters = ShotListQuery.create({
        page: 1, take: 10, ...query
    });

    filters.status = 'equalize_need_meeting'

    const user = req.user;
    if (user.permission !== 'admin' && !user.access.includes("shot-full-access")) {
        filters.userId = user.id;
    }

    const { shots, count } = await shotService.shotList(filters);

    return BaseController.ok(res, { shots: ShotListResponse.create(shots), count });
}

async function getShotListSpecial(req, res) {
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

    return BaseController.ok(res, { shots: ShotListResponse.create(shots), count });
}

async function getShotDetail(req, res) {
    const { id } = req.params;

    const response = await shotService.detail(id);
    return BaseController.ok(res, response);
}

async function updateInitShot(req, res) {
    const body = req.body;
    const { id } = req.params;
    const userId = req.user.id

    const validData = await shotValidation.updateShot(body);
    const response = await shotService.updateInitShot(id, userId, validData);
    return BaseController.ok(res, response)
}

async function updateEditorShot(req, res) {
    const body = req.body;
    const { id } = req.params;
    const userId = req.user.id

    const validData = await shotValidation.updateShot(body);
    const response = await shotService.updateEditorShot(id, userId, validData);
    return BaseController.ok(res, response)
}

async function updateEqualizingShot(req, res) {
    const body = req.body;
    const { id } = req.params;
    const userId = req.user.id

    const validData = await shotValidation.updateShot(body);
    const response = await shotService.updateEqualizingShot(id, userId, validData);
    return BaseController.ok(res, response)
}

async function updateNeedMeetingShot(req, res) {
    const body = req.body;
    const { id } = req.params;
    const userId = req.user.id

    const validData = await shotValidation.updateShot(body);
    const response = await shotService.updateEqualizingShot(id, userId, validData);
    return BaseController.ok(res, response)
}

async function updateShot(req, res) {
    const body = req.body;
    const { id, status } = req.params;
    const userId = req.user.id;

    const validData = await shotValidation.updateShot(body);
    const response = await shotService.updateShot(id, userId, validData);
    return BaseController.ok(res, response)
}

async function updateShotStatus(req, res) {
    const { status } = req.body;
    const id = req.params.id;
    const userId = req.user.id

    if (status && !['init-check', 'equalize_confirm', 'equalize_confirm_edit', 'equalize_need_meeting'].includes(status)) {
        throw ErrorResult.badRequest("status is invalid")
    }

    await shotService.updateStatus(id, status)
    return BaseController.ok(res)

}

async function deleteShot(req, res) {
    const id = req.params.id;

    const response = await shotService.deleteShot(id);
    return BaseController.ok(res, response)
}

async function deleteShotOfProject(req, res) {
    const { projectId } = req.params;

    const response = await shotService.deleteShotsOfProject(projectId);
    return BaseController.ok(res, response)
}

async function deleteShotsOfVideoFile(req, res) {
    const { videoFileId } = req.params;

    const response = await shotService.deleteShotsOfVideoFile(videoFileId);
    return BaseController.ok(res, response)
}

async function createInitShot(req, res) {
    const { videoFileId } = req.params;
    const body = req.body;

    const userId = req.user.id;

    const validData = await shotValidation.updateShot(body);
    const response = await shotService.createInitShotForVideoFile(videoFileId, userId, validData);

    return BaseController.ok(res, response);
}

async function createEditorShot(req, res) {
    const { videoFileId } = req.params;
    const body = req.body;

    const userId = req.user.id;

    const validData = await shotValidation.updateShot(body);
    const response = await shotService.createEditorShotForVideoFile(videoFileId, userId, validData);

    return BaseController.ok(res, response);
}

async function createEqualizingShot(req, res) {
    const { videoFileId } = req.params;
    const body = req.body;

    const userId = req.user.id;

    const validData = await shotValidation.updateShot(body);
    const response = await shotService.createEditorShotForVideoFile(videoFileId, userId, validData);

    return BaseController.ok(res, response);
}

// ====shots of video =====================================
async function getShotOfVideoFile(req, res) {
    const { videoFileId } = req.params
    const query = getDataFromReqQuery(req);
    const response = await shotService.getSections_Service(videoFileId, query);
    return BaseController.ok(res, response);
}

async function getInitShotOfVideoFile(req, res) {
    const { videoFileId } = req.params;

    const filters = {}
    filters.shotStatus = ['init-check', 'editor'];

    const videoFiles = await shotService.getSections_Service(videoFileId, filters);

    return BaseController.ok(res, videoFiles)
}

async function getEditorShotOfVideoFile(req, res) {
    const { videoFileId } = req.params;

    const filters = {};
    filters.shotStatus = ['editor', 'equalizing'];

    const videoFiles = await shotService.getSections_Service(videoFileId, filters);

    return BaseController.ok(res, videoFiles)
}

async function getEqualizingShotOfVideoFile(req, res) {
    const { videoFileId } = req.params;

    const filters = {}
    filters.shotStatus = ['equalizing', 'equalize_confirm', 'equalize_confirm_edit', 'equalize_need_meeting']

    const videoFiles = await shotService.getSections_Service(videoFileId, filters);

    return BaseController.ok(res, videoFiles)
}

async function exportShotListSpecial(req, res) {
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

async function getExportShotsId(req, res) {
    const query = getDataFromReqQuery(req);
    const { shots, isExcludeMode, ...filters } = query
    const shotsId = await shotExportService.getExportShotsId(shots, isExcludeMode, filters)
    return BaseController.ok(res, shotsId)
}

async function exportShots(req, res) {
    const { exportType } = req.params;
    const query = getDataFromReqQuery(req);

    const validData = shotValidation.exportShots(query.shotsId);
    const response = await shotExportService.exportShot(exportType, validData.shotsId)

    return BaseController.ok(res, response);
}

async function exportShotsOfProject(req, res) {
    const { exportType, projectId } = req.params;

    // const query = getDataFromReqQuery(req);

    // const validData = shotValidation.exportShots(query.shotsId);
    const response = await shotExportService.exportShotsOfProject(exportType, projectId)

    return BaseController.ok(res, response);
}

async function exportShotsOfVideo(req, res) {
    const { exportType, videoFileId } = req.params;

    // const query = getDataFromReqQuery(req);

    // const validData = shotValidation.exportShots(query.shotsId);
    const response = await shotExportService.exportShotsOfVideo(exportType, videoFileId)

    return BaseController.ok(res, response);
}

async function exportExcel(req, res) {
    const { exportType, shotId } = req.params;
    const shots = await shotExportService.exportShot(exportType, [shotId])
    return BaseController.ok(res, shots)
}

async function uploadExcel(req, res) {
    await ShotImportFileService.storeExcelFile(req);
    return BaseController.ok(res, {});
}


module.exports = {
    getBasicInfo,
    getExportInfoShots,
    getShotList,
    getMeetingShotList,
    getShotListSpecial,
    getShotDetail,
    updateInitShot,
    updateEditorShot,
    updateEqualizingShot,
    updateNeedMeetingShot,
    updateShot,
    updateShotStatus,
    deleteShot,
    deleteShotOfProject,
    deleteShotsOfVideoFile,
    createInitShot,
    createEditorShot,
    createEqualizingShot,
    getShotOfVideoFile,
    getInitShotOfVideoFile,
    getEditorShotOfVideoFile,
    getEqualizingShotOfVideoFile,
    exportShotListSpecial,
    getExportShotsId,
    exportShots,
    exportShotsOfProject,
    exportShotsOfVideo,
    exportExcel,
    uploadExcel,
};