const fs = require('fs');

const BaseController = require("../../_default/controller/Base.controller");
const { exportVideoService } = require("../../services/videoFile/index");
const ExportValidation = require('../../validation/videoFile/Export.validation');
const { rashService } = require('../../services/videoFile/index');
const { getDataFromReqQuery } = require('../../../helper/general.tool');
const ExportRushLogResponse = require('../../dto/videoFile/ExportRushLog.response');
const ExportFileResponse = require('../../dto/videoFile/ExportFile.response');
const ShotListResponse = require('../../dto/shotList/ShotList.response');

const fetchFiles = async (req, res) => {
    const files = await exportVideoService.getFiles(req.query)
    return BaseController.ok(res, { rows: ExportFileResponse.create(files.rows), count: files.count });
}

const shots = async (req, res) => {
    const { exportId } = req.params
    const query = getDataFromReqQuery(req);

    const { shots: items, count } = await exportVideoService.getShotsOfExport(exportId, query)

    return BaseController.ok(res, { shots: ShotListResponse.create(items), count });
}

const detailFile = async (req, res) => {
    const { id } = req.params;
    const file = await exportVideoService.getFile(id);
    return BaseController.ok(res, file);
}

const addShots = async (req, res) => {
    const query = getDataFromReqQuery(req);

    const { templateId, shotsId, isProduct, isExcludeMode } = req.body;
    await exportVideoService.createExportShots(req.user.id, { templateId, shotsId, isProduct, isExcludeMode }, query);
    return BaseController.ok(res);
}

const addVideos = async (req, res) => {
    const query = getDataFromReqQuery(req);

    const { templateId, videosId, isProduct, isExcludeMode } = req.body;
    await exportVideoService.createExportVideos(req.user.id, { templateId, videosId, isProduct, isExcludeMode }, query);
    return BaseController.ok(res);
}

const logsSite = async (req, res) => {
    const { exportId } = req.params;

    let result = await rashService.findByExportId(exportId);
    return BaseController.ok(res, ExportRushLogResponse.create(result));
}

const add2SiteQueue = async (req, res) => {
    const { exportId } = req.params;

    // let result = await rashService.GetAndSendDataByExportId(exportId, true);
    await rashService.setExportFile2Queue(exportId)
    return BaseController.ok(res);
}

const addFiles = async (req, res) => {
    let validData = ExportValidation.createExport(req.body)
    await exportVideoService.createFiles(req.user.id, validData)
    return BaseController.ok(res);
}

const update = async (req, res) => {
    const { exportId } = req.params
    await exportVideoService.modifyFile(exportId, true)
    return BaseController.ok(res);
}

const regenerate = async (req, res) => {
    const { exportId } = req.params
    await exportVideoService.modifyFile(exportId, false);
    return BaseController.ok(res);
}

const sendFiles2Site = async (req, res) => {
    const { exportFiles } = req.body
    await exportVideoService.setExportCodesProduct2Queue(exportFiles, false);
    return BaseController.ok(res);
}

const setFileIsImportant = async (req, res) => {
    const { exportId } = req.params
    const { isImportant } = req.body
    await exportVideoService.setImportantExportFile(+exportId, isImportant);
    return BaseController.ok(res);
}

const destroyFile = async (req, res) => {
    const { exportId } = req.body
    await exportVideoService.deleteFiles(exportId)
    return BaseController.ok(res);
}

const destroyItems = async (req, res) => {
    const { exportFiles } = req.body
    await exportVideoService.deleteFiles(exportFiles)
    return BaseController.ok(res);
}

const pathFile = async (req, res) => {
    const { id } = req.params
    const path = await exportVideoService.getPathFileById(id)
    return BaseController.ok(res, path);
}

const downloadUrl = async (req, res) => {
    try {
        const { id } = req.params;
        const link = await exportVideoService.getExportFileDownloadUrl(id)
        return res.status(200).json(link)

    } catch (err) {
        console.log('export download url', err)
        throw err;
    }
}

const show = async (req, res) => {
    try {
        const { id } = req.params;
        const { path, size } = await exportVideoService.getExportFileToShow(id);
        const range = req.headers.range;
        if (!range) {
            res.status(400).send("Requires Range header");
        }
        const CHUNK_SIZE = 10 ** 6;
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, size - 1);
        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${size}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        };
        res.writeHead(206, headers);
        const stream = fs.createReadStream(path, { start, end });
        stream.pipe(res);

        return;
    }
    catch (err) {
        console.log('export', err)
        throw err;
    }
}

// send2Product(req, res) {
//     const { exportId } = req.params;

//     emitter.emit('exportComplete', exportId)

//     return BaseController.ok(res);
// }

// async createExportFileForShot(req, res){
//     const { shotId } = req.params;

//     const exportDetail = await ExportVideoFileService.reqToCreateFile(shotId);

//     return BaseController.ok(res, exportDetail);
// }

module.exports = {
    fetchFiles,
    shots,
    detailFile,
    addShots,
    addVideos,
    logsSite,
    addFiles,
    add2SiteQueue,
    update,
    regenerate,
    sendFiles2Site,
    setFileIsImportant,
    destroyFile,
    destroyItems,
    pathFile,
    downloadUrl,
    show
};
