const path = require('path');

const Service = require("../../_default/service");
const { ExportVideoFile, ExportVideoDetail, ExportRushLog } = require("../../_default/model");
const fs = require('fs')
const Sequelize = require('sequelize');
const VideoFileService = require('./VideoFile.service');
const VideoDetailService = require('../videoDetail/VideoDetail.service');
const VideoTemplateService = require('./VideoTemplate.service')
const { listShots, getByIds, getByAttribute } = require('../shotList/Shot.service')
const { listScoresForShot } = require('../shotList/ShotScore.service')
const { exportShots, getSpecialShotList } = require('../shotList/ShotExport.service');
const ErrorResult = require('../../../helper/error.tool');
const treeKill = require('tree-kill');
const { generateRandomCode } = require('../../../helper/general.tool');
const emitter = require('../../_default/eventEmitter');
const { logError } = require('../../../helper/log.tool');
const TypeTool = require('../../../helper/type.tool');
const Op = Sequelize.Op;
const Redis = require("../../../db/redis");
const { resolutions } = require('./VideoEditor.service');
const { errorLog } = require('../../../helper/showLog');

class ExportVideoService extends Service {

    constructor(
        videoEditorService = () => { }
    ) {
        super(ExportVideoFile)
        this.videoEditorService = videoEditorService;
        this.videoFileService = new VideoFileService();
        this.videoTemplateService = new VideoTemplateService()
        // No longer instantiating classes
        this.videoDetailService = new VideoDetailService()
    }

    // ... other methods

    async createExportShots(userId, body, query) {
        const { templateId, shotsId, isProduct, isExcludeMode } = body

        const template = await this.videoTemplateService.getById(templateId)

        let shotsItems = null
        if (isExcludeMode) {
            ({ shots: shotsItems } = (await getSpecialShotList({ excludesId: shotsId, ...query, page: 1, take: null })))
        } else {
            shotsItems = await getByIds(shotsId)
        }

        for (const shot of shotsItems) {
            const code = await this.generateExportCode();
            const exportFile = await ExportVideoFile.create({
                title: shot.title.slice(0, 255),
                userId,
                isProduct,
                qualityExport: template.quality,
                isMute: template.isMute,
                code,
                bitrate: template.bitrate,
                logoParams: template.logoParams,
                textParams: template.textParams,
                gifTime: template.gifTime,
                status: 'queue',
            });

            const {
                id: shotId,
                videoFileId: videoId,
                startTime: startCutTime,
                endTime: endCutTime
            } = shot
            await ExportVideoDetail.create({ videoId, shotId, startCutTime, endCutTime, exportId: exportFile.id, status: 'queue' })
        }
    }

    async getShotsOfExport(exportId, filters = {}) {
        const exportShotsData = await this.findAllDetailByExportId(exportId)
        const exportShots = exportShotsData.map(item => item.toJSON())
        let shotsId = []
        for (const eShot of exportShots) {
            const { shotId } = eShot
            if (shotId) shotsId.push(shotId)
        }
        return await listShots({ ...filters, id: shotsId })
    }

    async modifyFile(exportId, reSend = true) {
        const detailsData = await this.findAllDetailByExportId(exportId)
        const exportDetails = detailsData.map(item => item.toJSON());
        const { isProduct } = exportDetails[0].export;
        const shotsId = exportDetails.filter(x => !!x.shotId).map(x => x.shotId)

        const shots = (await getByIds(shotsId)).map(x => x.toJSON())

        for (const detail of detailsData) {
            const findShot = shots.find(x => x.id == detail.shotId)
            if (findShot) {
                detail.startCutTime = findShot.startTime
                detail.endCutTime = findShot.endTime
                await detail.save()
            }
        }

        const sqlQuery = { status: 'queue' }
        if (isProduct == 1 && reSend) {
            sqlQuery.productStatus = 'queue'
        }

        await ExportVideoFile.update(
            { ...sqlQuery }, // New values to set
            { where: { id: exportId } } // Conditions (e.g., based on `id`)
        );

        if (!reSend) {
            await this.setOnlyReBuild(exportId);
        }
    }

    // ... other methods, no changes needed for them as they don't use the refactored services directly
}

module.exports = ExportVideoService;