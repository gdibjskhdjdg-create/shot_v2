const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const ShotList_DTO = require("../../dto/shotList/ShotList.dto");
const ShotListQuery_DTO = require("../../dto/shotList/ShotListQuery.dto");
const { shotService, shotExportService } = require("../../services/shotList/index");
const { validateUpdateShot, validateExportShots } = require("../../validation/shotList/shot.validation");
const ShotImportFileService = require('../../services/shotList/ShotImportFile.service');
const ErrorResult = require('../../../helper/error.tool');

const getShotBasicInfo = async (req, res) => {
    const response = await shotService.getShotFormBasicInfo();
    return BaseController.ok(res, response);
};

const getShotExportInfo = async (req, res) => {
    const query = getDataFromReqQuery(req);
    const { shots, isExcludeMode, ...filters } = query;
    const info = await shotService.getShotsExportInfo({ shots, isExcludeMode, filters });
    return BaseController.ok(res, info);
};

const listShotsController = async (req, res) => {
    const { status } = req.params;
    if (status && !['init-check', 'equalizing', 'equalized'].includes(status)) {
        throw ErrorResult.notFound();
    }
    const query = getDataFromReqQuery(req);
    const filters = ShotListQuery_DTO.create({ page: 1, take: 10, ...query });
    filters.status = status === 'equalized' ? ['equalize_confirm', 'equalize_confirm_edit', 'equalize_need_meeting'] : status;
    const user = req.user;
    if (user.permission !== 'admin' && !user.access.includes("shot-full-access") && !user.access.includes("shot-list")) {
        filters.userId = user.id;
    }
    const { shots, count } = await shotService.listShots(filters);
    return BaseController.ok(res, { shots: ShotList_DTO.create(shots), count });
};

const listMeetingShotsController = async (req, res) => {
    const query = getDataFromReqQuery(req);
    const filters = ShotListQuery_DTO.create({ page: 1, take: 10, ...query });
    filters.status = 'equalize_need_meeting';
    const user = req.user;
    if (user.permission !== 'admin' && !user.access.includes("shot-full-access")) {
        filters.userId = user.id;
    }
    const { shots, count } = await shotService.listShots(filters);
    return BaseController.ok(res, { shots: ShotList_DTO.create(shots), count });
};

const listSpecialShotsController = async (req, res) => {
    const query = getDataFromReqQuery(req);
    const filters = { page: 1, take: 10, ...query };
    const user = req.user;
    if (user.permission !== 'admin' && !user.access.includes("shot-full-access") && !user.access.includes("shot-list")) {
        filters.userId = user.id;
    }
    const { shots, count } = await shotService.listSpecialShots(filters);
    return BaseController.ok(res, { shots: ShotList_DTO.create(shots), count });
};

const getShotDetailsController = async (req, res) => {
    const { id } = req.params;
    const response = await shotService.getShotDetails(id);
    return BaseController.ok(res, response);
};

const updateShotController = async (req, res) => {
    const { id } = req.params;
    const validData = await validateUpdateShot(req.body);
    const response = await shotService.updateShotDetails(id, req.user.id, validData);
    return BaseController.ok(res, response);
};

const updateInitShotController = async (req, res) => {
    const { id } = req.params;
    const validData = await validateUpdateShot(req.body);
    const response = await shotService.updateShotDetails(id, req.user.id, { ...validData, status: 'editor', logMode: "init-check" });
    return BaseController.ok(res, response);
};

const updateEditorShotController = async (req, res) => {
    const { id } = req.params;
    const validData = await validateUpdateShot(req.body);
    const response = await shotService.updateShotDetails(id, req.user.id, { ...validData, status: 'equalizing', logMode: "editor" });
    return BaseController.ok(res, response);
};

const updateEqualizingShotController = async (req, res) => {
    const { id } = req.params;
    const validData = await validateUpdateShot(req.body);
    const response = await shotService.updateShotDetails(id, req.user.id, { ...validData, status: 'equalized', logMode: "equalizing" });
    return BaseController.ok(res, response);
};

const updateMeetingShotController = async (req, res) => {
    const { id } = req.params;
    const validData = await validateUpdateShot(req.body);
    const response = await shotService.updateShotDetails(id, req.user.id, { ...validData, logMode: "equalize_need_meeting" });
    return BaseController.ok(res, response);
};

const updateShotStatusController = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    if (status && !['init-check', 'equalize_confirm', 'equalize_confirm_edit', 'equalize_need_meeting'].includes(status)) {
        throw ErrorResult.badRequest("status is invalid");
    }
    await shotService.updateShotStatus(id, status);
    return BaseController.ok(res);
};

const deleteShotController = async (req, res) => {
    const { id } = req.params;
    await shotService.deleteShotById(id);
    return BaseController.ok(res);
};

const deleteShotsByProjectIdController = async (req, res) => {
    const { projectId } = req.params;
    await shotService.deleteShotsByProjectId(projectId);
    return BaseController.ok(res);
};

const deleteShotsByVideoFileIdController = async (req, res) => {
    const { videoFileId } = req.params;
    await shotService.deleteShotsByVideoFileId(videoFileId);
    return BaseController.ok(res);
};

const createShotController = async (req, res, status) => {
    const { videoFileId } = req.params;
    const validData = await validateUpdateShot(req.body);
    const response = await shotService.createShotForVideoFile(videoFileId, req.user.id, { ...validData, status });
    return BaseController.ok(res, response);
};

const createInitShotController = (req, res) => createShotController(req, res, 'editor');
const createEditorShotController = (req, res) => createShotController(req, res, 'equalizing');
const createEqualizingShotController = (req, res) => createShotController(req, res, 'equalized');

const listShotsByVideoFileController = async (req, res) => {
    const { videoFileId } = req.params;
    const query = getDataFromReqQuery(req);
    const response = await shotService.listShotsByVideoFile(videoFileId, query);
    return BaseController.ok(res, response);
};

const listShotsByVideoFileAndStatusController = async (req, res, shotStatus) => {
    const { videoFileId } = req.params;
    const videoFiles = await shotService.listShotsByVideoFile(videoFileId, { shotStatus });
    return BaseController.ok(res, videoFiles);
};

const listInitShotsByVideoFileController = (req, res) => listShotsByVideoFileAndStatusController(req, res, ['init-check', 'editor']);
const listEditorShotsByVideoFileController = (req, res) => listShotsByVideoFileAndStatusController(req, res, ['editor', 'equalizing']);
const listEqualizingShotsByVideoFileController = (req, res) => listShotsByVideoFileAndStatusController(req, res, ['equalizing', 'equalize_confirm', 'equalize_confirm_edit', 'equalize_need_meeting']);

const exportSpecialShotsController = async (req, res) => {
    const { exportType } = req.params;
    const query = getDataFromReqQuery(req);
    const filters = { page: 1, excludesId: null, ...query };
    const user = req.user;
    if (user.permission !== 'admin' && !user.access.includes("shot-full-access")) {
        filters.userId = user.id;
    }
    const response = await shotExportService.exportSpecialShot(exportType, filters);
    return BaseController.ok(res, response);
};

const getExportableShotIdsController = async (req, res) => {
    const query = getDataFromReqQuery(req);
    const { shots, isExcludeMode, ...filters } = query;
    const shotsId = await shotExportService.getExportShotsId(shots, isExcludeMode, filters);
    return BaseController.ok(res, shotsId);
};

const exportShotsByIdsController = async (req, res) => {
    const { exportType } = req.params;
    const query = getDataFromReqQuery(req);
    const validData = validateExportShots(query.shotsId);
    const response = await shotExportService.exportShot(exportType, validData.shotsId);
    return BaseController.ok(res, response);
};

const exportShotsByProjectIdController = async (req, res) => {
    const { exportType, projectId } = req.params;
    const response = await shotExportService.exportShotsOfProject(exportType, projectId);
    return BaseController.ok(res, response);
};

const exportShotsByVideoIdController = async (req, res) => {
    const { exportType, videoFileId } = req.params;
    const response = await shotExportService.exportShotsOfVideo(exportType, videoFileId);
    return BaseController.ok(res, response);
};

const exportSingleShotAsExcelController = async (req, res) => {
    const { exportType, shotId } = req.params;
    const shots = await shotExportService.exportShot(exportType, [shotId]);
    return BaseController.ok(res, shots);
};

const importShotsFromExcelController = async (req, res) => {
    await ShotImportFileService.storeExcelFile(req);
    return BaseController.ok(res, {});
};

module.exports = {
    getShotBasicInfo,
    getShotExportInfo,
    listShots: listShotsController,
    listMeetingShots: listMeetingShotsController,
    listSpecialShots: listSpecialShotsController,
    getShotDetails: getShotDetailsController,
    updateInitShot: updateInitShotController,
    updateEditorShot: updateEditorShotController,
    updateEqualizingShot: updateEqualizingShotController,
    updateMeetingShot: updateMeetingShotController,
    updateShot: updateShotController,
    updateShotStatus: updateShotStatusController,
    deleteShot: deleteShotController,
    deleteShotsByProjectId: deleteShotsByProjectIdController,
    deleteShotsByVideoFileId: deleteShotsByVideoFileIdController,
    createInitShot: createInitShotController,
    createEditorShot: createEditorShotController,
    createEqualizingShot: createEqualizingShotController,
    listShotsByVideoFile: listShotsByVideoFileController,
    listInitShotsByVideoFile: listInitShotsByVideoFileController,
    listEditorShotsByVideoFile: listEditorShotsByVideoFileController,
    listEqualizingShotsByVideoFile: listEqualizingShotsByVideoFileController,
    exportSpecialShots: exportSpecialShotsController,
    getExportableShotIds: getExportableShotIdsController,
    exportShotsByIds: exportShotsByIdsController,
    exportShotsByProjectId: exportShotsByProjectIdController,
    exportShotsByVideoId: exportShotsByVideoIdController,
    exportSingleShotAsExcel: exportSingleShotAsExcelController,
    importShotsFromExcel: importShotsFromExcelController,
};