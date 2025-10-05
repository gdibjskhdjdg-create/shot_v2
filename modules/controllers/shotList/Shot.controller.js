const ResponseDTO = require("../../_default/Response.dto");
const ShotListResponse = require("../../dto/shotList/ShotList.response");
const ShotListQuery = require("../../dto/shotList/ShotList.query");
const { shotService, shotExportService } = require("../../services/shotList/index");
const shotValidation = require("../../validation/shotList/shot.validation");
const ShotImportFileService = require('../../services/shotList/ShotImportFile.service');
const ErrorResult = require('../../../helper/error.tool');

async function fetchBasicInfo(req, res) {
    const response = await shotService.getBasicInfoForShot();
    return ResponseDTO.success(res, response);
}

async function fetchExportInfoShots(req, res) {
    const { shots, isExcludeMode, ...filters } = req.query
    const info = await shotService.getExportInfoShots({ shots, isExcludeMode, filters })
    return ResponseDTO.success(res, info)
}

async function fetchShotList(req, res) {

    const { status } = req.params;

    if (status && !['init-check', 'equalizing', 'equalized'].includes(status)) {
        throw ErrorResult.notFound()
    }

    const filters = ShotListQuery.create({
        page: 1, take: 10, ...req.query
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

    return ResponseDTO.success(res, { shots: ShotListResponse.create(shots), count });
}

async function fetchMeetingShotList(req, res) {
    const filters = ShotListQuery.create({
        page: 1, take: 10, ...req.query
    });

    filters.status = 'equalize_need_meeting'

    const user = req.user;
    if (user.permission !== 'admin' && !user.access.includes("shot-full-access")) {
        filters.userId = user.id;
    }

    const { shots, count } = await shotService.shotList(filters);

    return ResponseDTO.success(res, { shots: ShotListResponse.create(shots), count });
}

async function fetchShotListSpecial(req, res) {
    const filters = {
        page: 1,
        take: 10,
        ...req.query
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

    return ResponseDTO.success(res, { shots: ShotListResponse.create(shots), count });
}

async function fetchShotDetail(req, res) {
    const { id } = req.params;

    const response = await shotService.detail(id);
    return ResponseDTO.success(res, response);
}

async function modifyInitShot(req, res) {
    const body = req.body;
    const { id } = req.params;
    const userId = req.user.id

    const validData = await shotValidation.updateShot(body);
    const response = await shotService.updateInitShot(id, userId, validData);
    return ResponseDTO.success(res, response)
}

async function modifyEditorShot(req, res) {
    const body = req.body;
    const { id } = req.params;
    const userId = req.user.id

    const validData = await shotValidation.updateShot(body);
    const response = await shotService.updateEditorShot(id, userId, validData);
    return ResponseDTO.success(res, response)
}

async function modifyEqualizingShot(req, res) {
    const body = req.body;
    const { id } = req.params;
    const userId = req.user.id

    const validData = await shotValidation.updateShot(body);
    const response = await shotService.updateEqualizingShot(id, userId, validData);
    return ResponseDTO.success(res, response)
}

async function modifyNeedMeetingShot(req, res) {
    const body = req.body;
    const { id } = req.params;
    const userId = req.user.id

    const validData = await shotValidation.updateShot(body);
    const response = await shotService.updateEqualizingShot(id, userId, validData);
    return ResponseDTO.success(res, response)
}

async function modifyShot(req, res) {
    const body = req.body;
    const { id, status } = req.params;
    const userId = req.user.id;

    const validData = await shotValidation.updateShot(body);
    const response = await shotService.updateShot(id, userId, validData);
    return ResponseDTO.success(res, response)
}

async function modifyShotStatus(req, res) {
    const { status } = req.body;
    const id = req.params.id;
    const userId = req.user.id

    if (status && !['init-check', 'equalize_confirm', 'equalize_confirm_edit', 'equalize_need_meeting'].includes(status)) {
        throw ErrorResult.badRequest("status is invalid")
    }

    await shotService.updateStatus(id, status)
    return ResponseDTO.success(res)

}

async function removeShot(req, res) {
    const id = req.params.id;

    const response = await shotService.deleteShot(id);
    return ResponseDTO.success(res, response)
}

async function removeShotOfProject(req, res) {
    const { projectId } = req.params;

    const response = await shotService.deleteShotsOfProject(projectId);
    return ResponseDTO.success(res, response)
}

async function removeShotsOfVideoFile(req, res) {
    const { videoFileId } = req.params;

    const response = await shotService.deleteShotsOfVideoFile(videoFileId);
    return ResponseDTO.success(res, response)
}

async function addInitShot(req, res) {
    const { videoFileId } = req.params;
    const body = req.body;

    const userId = req.user.id;

    const validData = await shotValidation.updateShot(body);
    const response = await shotService.createInitShotForVideoFile(videoFileId, userId, validData);

    return ResponseDTO.success(res, response);
}

async function addEditorShot(req, res) {
    const { videoFileId } = req.params;
    const body = req.body;

    const userId = req.user.id;

    const validData = await shotValidation.updateShot(body);
    const response = await shotService.createEditorShotForVideoFile(videoFileId, userId, validData);

    return ResponseDTO.success(res, response);
}

async function addEqualizingShot(req, res) {
    const { videoFileId } = req.params;
    const body = req.body;

    const userId = req.user.id;

    const validData = await shotValidation.updateShot(body);
    const response = await shotService.createEditorShotForVideoFile(videoFileId, userId, validData);

    return ResponseDTO.success(res, response);
}

// ====shots of video =====================================
async function fetchShotOfVideoFile(req, res) {
    const { videoFileId } = req.params
    const response = await shotService.getSections_Service(videoFileId, req.query);
    return ResponseDTO.success(res, response);
}

async function fetchInitShotOfVideoFile(req, res) {
    const { videoFileId } = req.params;

    const filters = {}
    filters.shotStatus = ['init-check', 'editor'];

    const videoFiles = await shotService.getSections_Service(videoFileId, filters);

    return ResponseDTO.success(res, videoFiles)
}

async function fetchEditorShotOfVideoFile(req, res) {
    const { videoFileId } = req.params;

    const filters = {};
    filters.shotStatus = ['editor', 'equalizing'];

    const videoFiles = await shotService.getSections_Service(videoFileId, filters);

    return ResponseDTO.success(res, videoFiles)
}

async function fetchEqualizingShotOfVideoFile(req, res) {
    const { videoFileId } = req.params;

    const filters = {}
    filters.shotStatus = ['equalizing', 'equalize_confirm', 'equalize_confirm_edit', 'equalize_need_meeting']

    const videoFiles = await shotService.getSections_Service(videoFileId, filters);

    return ResponseDTO.success(res, videoFiles)
}

async function exportSpecialShotList(req, res) {
    const { exportType } = req.params;

    const filters = {
        page: 1,
        excludesId: null,
        ...req.query
    };

    const user = req.user;
    if (user.permission !== 'admin' && !user.access.includes("shot-full-access")) {
        filters.userId = user.id;
    }

    const response = await shotExportService.exportSpecialShot(exportType, filters)

    return ResponseDTO.success(res, response);
}

async function fetchExportShotsId(req, res) {
    const { shots, isExcludeMode, ...filters } = req.query
    const shotsId = await shotExportService.getExportShotsId(shots, isExcludeMode, filters)
    return ResponseDTO.success(res, shotsId)
}

async function exportShotData(req, res) {
    const { exportType } = req.params;

    const validData = shotValidation.exportShots(req.query.shotsId);
    const response = await shotExportService.exportShot(exportType, validData.shotsId)

    return ResponseDTO.success(res, response);
}

async function exportProjectShots(req, res) {
    const { exportType, projectId } = req.params;

    const response = await shotExportService.exportShotsOfProject(exportType, projectId)

    return ResponseDTO.success(res, response);
}

async function exportVideoShots(req, res) {
    const { exportType, videoFileId } = req.params;

    const response = await shotExportService.exportShotsOfVideo(exportType, videoFileId)

    return ResponseDTO.success(res, response);
}

async function exportToExcel(req, res) {
    const { exportType, shotId } = req.params;
    const shots = await shotExportService.exportShot(exportType, [shotId])
    return ResponseDTO.success(res, shots)
}

async function importFromExcel(req, res) {
    await ShotImportFileService.storeExcelFile(req);
    return ResponseDTO.success(res, {});
}


module.exports = {
    fetchBasicInfo,
    fetchExportInfoShots,
    fetchShotList,
    fetchMeetingShotList,
    fetchShotListSpecial,
    fetchShotDetail,
    modifyInitShot,
    modifyEditorShot,
    modifyEqualizingShot,
    modifyNeedMeetingShot,
    modifyShot,
    modifyShotStatus,
    removeShot,
    removeShotOfProject,
    removeShotsOfVideoFile,
    addInitShot,
    addEditorShot,
    addEqualizingShot,
    fetchShotOfVideoFile,
    fetchInitShotOfVideoFile,
    fetchEditorShotOfVideoFile,
    fetchEqualizingShotOfVideoFile,
    exportSpecialShotList,
    fetchExportShotsId,
    exportShotData,
    exportProjectShots,
    exportVideoShots,
    exportToExcel,
    importFromExcel,
};