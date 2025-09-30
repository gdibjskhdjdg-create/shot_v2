const path = require('path');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const fs = require('fs');
const ErrorResult = require('../../../helper/error.tool');
const { generateRandomCode } = require('../../../helper/general.tool');
const emitter = require('../../_default/eventEmitter');
const { ExportVideoFile, ExportVideoDetail, ExportRushLog } = require("../../_default/model");

// Import functional services directly
const videoFileService = require('./VideoFile.service');
const videoTemplateService = require('./VideoTemplate.service');
const shotService = require('../shotList/Shot.service');
const shotExportService = require('../shotList/ShotExport.service');

// --- Helper Functions ---

const findDetailsByExportId = (exportId) => {
    return ExportVideoDetail.findAll({ 
        where: { exportId },
        include: [{ model: ExportVideoFile, as: 'export' }]
    });
};

const generateUniqueExportCode = async () => {
    let code;
    let isUnique = false;
    while (!isUnique) {
        code = generateRandomCode(7);
        const existing = await ExportVideoFile.findOne({ where: { code } });
        if (!existing) {
            isUnique = true;
        }
    }
    return code;
};

const getPathForExport = (exportCode) => {
    const storePath = path.join(__dirname, '..', '..', '..', process.env.Content_PATH);
    return path.join(storePath, 'exports', exportCode);
}

const getRootDir = () => {
    return path.join(__dirname, '..', '..', '..');
}

// --- Public API ---

const listExports = async (filters = {}) => {
    const { page = 1, take = 10, ...where } = filters;
    const query = { where, order: [['createdAt', 'DESC']] };
    const [count, rows] = await Promise.all([
        ExportVideoFile.count(query),
        ExportVideoFile.findAll({ ...query, limit: take, offset: (page - 1) * take })
    ]);
    return { count, rows };
};

const createExportsForShots = async (userId, body, query) => {
    const { templateId, shotsId, isProduct, isExcludeMode } = body;
    const template = await videoTemplateService.getById(templateId);
    if (!template) throw ErrorResult.notFound('Template not found');

    let shotsToExport;
    if (isExcludeMode) {
        const { shots } = await shotExportService.getSpecialShotList({ ...query, excludesId: shotsId, page: 1, take: null });
        shotsToExport = shots;
    } else {
        shotsToExport = await shotService.getShotsByIds(shotsId);
    }

    if (!shotsToExport || shotsToExport.length === 0) {
        throw ErrorResult.badRequest("No shots found to export.");
    }

    for (const shot of shotsToExport) {
        const code = await generateUniqueExportCode();
        const exportFile = await ExportVideoFile.create({
            title: shot.title.slice(0, 255),
            userId,
            isProduct: isProduct || false,
            qualityExport: template.quality,
            isMute: template.isMute,
            code,
            bitrate: template.bitrate,
            logoParams: template.logoParams,
            textParams: template.textParams,
            gifTime: template.gifTime,
            status: 'queue',
        });

        await ExportVideoDetail.create({
            videoId: shot.videoFileId,
            shotId: shot.id,
            startCutTime: shot.startTime,
            endCutTime: shot.endTime,
            exportId: exportFile.id,
            status: 'queue'
        });
    }
};

const getShotsForExport = async (exportId, filters = {}) => {
    const exportDetails = await findDetailsByExportId(exportId);
    const shotIds = exportDetails.map(detail => detail.shotId).filter(id => id);

    if (shotIds.length === 0) {
        return { shots: [], count: 0 };
    }

    return await shotService.listShots({ ...filters, id: shotIds });
};

const rebuildExportFile = async (exportId, resendToQueue = true) => {
    const details = await findDetailsByExportId(exportId);
    if (details.length === 0) throw ErrorResult.notFound("Export details not found.");

    const shotIds = details.map(d => d.shotId).filter(Boolean);
    const shots = await shotService.getShotsByIds(shotIds);
    const shotsMap = new Map(shots.map(s => [s.id, s.toJSON()]));

    for (const detail of details) {
        const shot = shotsMap.get(detail.shotId);
        if (shot) {
            detail.startCutTime = shot.startTime;
            detail.endCutTime = shot.endTime;
            await detail.save();
        }
    }

    const { isProduct } = (details[0].export?.toJSON()) || {};
    const updatePayload = { status: 'queue' };
    if (isProduct && resendToQueue) {
        updatePayload.productStatus = 'queue';
    }

    await ExportVideoFile.update(updatePayload, { where: { id: exportId } });

    if (!resendToQueue) {
        emitter.emit('exportVideo_reBuild', exportId);
    }
};

// Exporting log and status functions
const setPendingExportFile = (exportId) => ExportVideoFile.update({ status: 'pending' }, { where: { id: exportId } });
const setCompleteExportFile = (exportId) => ExportVideoFile.update({ status: 'complete' }, { where: { id: exportId } });
const setErrorExportFile = (exportId) => ExportVideoFile.update({ status: 'error' }, { where: { id: exportId } });
const setPendingDetail = (detailId) => ExportVideoDetail.update({ status: 'pending' }, { where: { id: detailId } });
const setCompleteDetail = (detailId) => ExportVideoDetail.update({ status: 'complete' }, { where: { id: detailId } });
const setErrorDetail = (detailId) => ExportVideoDetail.update({ status: 'error' }, { where: { id: detailId } });

const setLastCommandExportFile = (id, lastCommand, startTime, endTime, pid) => {
    return ExportVideoFile.update({ lastCommand, lastCommandRunAt: startTime, lastCommandEndAt: endTime, lastPid: pid }, { where: { id } });
};

const setLastCommandDetailFile = (id, lastCommand, startTime, endTime, pid) => {
    return ExportVideoDetail.update({ lastCommand, lastCommandRunAt: startTime, lastCommandEndAt: endTime, lastPid: pid }, { where: { id } });
};


module.exports = {
    listExports,
    createExportsForShots,
    getShotsForExport,
    rebuildExportFile,
    findDetailsByExportId,
    getPathForExport,
    getRootDir,
    // Status and logging
    setPendingExportFile,
    setCompleteExportFile,
    setErrorExportFile,
    setPendingDetail,
    setCompleteDetail,
    setErrorDetail,
    setLastCommandExportFile,
    setLastCommandDetailFile
};