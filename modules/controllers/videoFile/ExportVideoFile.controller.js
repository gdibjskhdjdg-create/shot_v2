const fs = require('fs');

const BaseController = require("../../_default/controller/Base.controller");
const { exportVideoService } = require("../../services/videoFile/index");
const ExportValidation = require('../../validation/videoFile/Export.validation');
const { rashService } = require('../../services/videoFile/index');
const { getDataFromReqQuery } = require('../../../helper/general.tool');
const ExportRushLog_DTO = require('../../dto/videoFile/ExportRushLog.dto');
const ExportFile_DTO = require('../../dto/videoFile/ExportFile.dto');
const ShotList_DTO = require('../../dto/shotList/ShotList.dto');

class ExportVideoFileController {
    async getExportFiles(req, res) {
        const files = await exportVideoService.getFiles(req.query)
        return BaseController.ok(res, { rows: ExportFile_DTO.create(files.rows), count: files.count });
    }

    async getShotsOfExport(req, res) {

        const { exportId } = req.params
        const query = getDataFromReqQuery(req);

        const { shots: items, count } = await exportVideoService.getShotsOfExport(exportId, query)

        return BaseController.ok(res, { shots: ShotList_DTO.create(items), count });
    }

    async getExportFile(req, res) {
        const { id } = req.params;
        const file = await exportVideoService.getFile(id);
        return BaseController.ok(res, file);
    }

    async createExportShots(req, res) {
        const query = getDataFromReqQuery(req);

        const { templateId, shotsId, isProduct, isExcludeMode } = req.body;
        await exportVideoService.createExportShots(req.user.id, { templateId, shotsId, isProduct, isExcludeMode }, query);
        return BaseController.ok(res);
    }


    async createExportVideos(req, res) {
        const query = getDataFromReqQuery(req);

        const { templateId, videosId, isProduct, isExcludeMode } = req.body;
        await exportVideoService.createExportVideos(req.user.id, { templateId, videosId, isProduct, isExcludeMode }, query);
        return BaseController.ok(res);
    }


    async getLogSite(req, res) {
        const { exportId } = req.params;

        let result = await rashService.findByExportId(exportId);
        return BaseController.ok(res, ExportRushLog_DTO.create(result));
    }

    async reqToSendToSite(req, res) {
        const { exportId } = req.params;

        // let result = await rashService.GetAndSendDataByExportId(exportId, true);
        await rashService.setExportFile2Queue(exportId)
        return BaseController.ok(res);
    }

    async createExportFiles(req, res) {
        let validData = ExportValidation.createExport(req.body)
        await exportVideoService.createFiles(req.user.id, validData)
        return BaseController.ok(res);
    }

    async modifyFile(req, res) {
        const { exportId } = req.params
        await exportVideoService.modifyFile(exportId, true)
        return BaseController.ok(res);
    }

    async rebuildFile(req, res) {
        const { exportId } = req.params
        await exportVideoService.modifyFile(exportId, false);
        return BaseController.ok(res);
    }

    async sendFiles2Rush(req, res) {
        const { exportFiles } = req.body
        await exportVideoService.setExportCodesProduct2Queue(exportFiles, false);
        return BaseController.ok(res);
    }

    async setImportantExportFile(req, res) {
        const { exportId } = req.params
        const { isImportant } = req.body
        await exportVideoService.setImportantExportFile(+exportId, isImportant);
        return BaseController.ok(res);
    }

    async destroyExportFile(req, res) {
        const { exportId } = req.body
        await exportVideoService.deleteFiles(exportId)
        return BaseController.ok(res);
    }


    async destroyExportFiles(req, res) {
        const { exportFiles } = req.body
        await exportVideoService.deleteFiles(exportFiles)
        return BaseController.ok(res);
    }


    async getPathExportFile(req, res) {
        const { id } = req.params
        const path = await exportVideoService.getPathFileById(id)
        return BaseController.ok(res, path);
    }

    async downloadExportFileUrl(req, res) {
        try {
            const { id } = req.params;
            const link = await exportVideoService.getExportFileDownloadUrl(id)
            return res.status(200).json(link)

        } catch (err) {
            console.log('export download url', err)
            throw err;
        }
    }

    async showExportFile(req, res) {
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
}

module.exports = new ExportVideoFileController();
