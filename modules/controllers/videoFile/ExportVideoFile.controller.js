const BaseController = require("../../_default/controller/Base.controller");
const exportVideoService = require("../../services/videoFile/ExportVideo.service");
const { getDataFromReqQuery } = require('../../../helper/general.tool');
const ExportFile_DTO = require('../../dto/videoFile/ExportFile.dto');
const ShotList_DTO = require('../../dto/shotList/ShotList.dto');

const listExports = async (req, res) => {
    const { count, rows } = await exportVideoService.listExportFiles(req.query);
    const transformedFiles = ExportFile_DTO.create(rows);
    return BaseController.ok(res, { rows: transformedFiles, count });
};

const listExportShots = async (req, res) => {
    const { exportId } = req.params;
    const query = getDataFromReqQuery(req);
    const { shots, count } = await exportVideoService.getShotsForExport(exportId, query);
    const transformedShots = ShotList_DTO.create(shots);
    return BaseController.ok(res, { shots: transformedShots, count });
};

const createExports = async (req, res) => {
    await exportVideoService.createExportsForShots(req.user.id, req.body, req.query);
    return BaseController.ok(res, { message: "Export process started for shots." });
};

const reExport = async (req, res) => {
    const { exportId } = req.params;
    await exportVideoService.rebuildExportFile(exportId, true);
    return BaseController.ok(res, { message: "Re-export process has been queued." });
};


module.exports = {
    listExports,
    listExportShots,
    createExports,
    reExport
};