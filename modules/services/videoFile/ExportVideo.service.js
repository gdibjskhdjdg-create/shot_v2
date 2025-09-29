const path = require('path');

const Service = require("../../_default/service");
const { ExportVideoFile, ExportVideoDetail, ExportRushLog } = require("../../_default/model");
const fs = require('fs')
const Sequelize = require('sequelize');
const VideoFileService = require('./VideoFile.service');
const VideoDetailService = require('../videoDetail/VideoDetail.service');
const VideoTemplateService = require('./VideoTemplate.service')
const ShotService = require('../shotList/Shot.service')
const ShotScoreService = require('../shotList/ShotScore.service')
const ShotExportService = require('../shotList/ShotExport.service');
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
        this.shotService = new ShotService(this.videoFileService)
        this.shotScore = new ShotScoreService()
        this.shotExport = new ShotExportService(this.shotService, this.shotScore)
        this.videoDetailService = new VideoDetailService()
    }

    async getFiles(query) {
        const id = query.id
        const productId = query.productId
        const code = query.code
        const status = query.status
        const isProduct = query.isProduct
        const productStatus = query.productStatus
        const title = query.title
        const page = query.page || 1
        const take = query.take || 10

        let queryParams = { where: {} }

        if (id && TypeTool.isNotEmptyString(id)) queryParams.where['id'] = { [Op.like]: `%${id}%` }
        if (title && TypeTool.isNotEmptyString(title)) queryParams.where['title'] = { [Op.like]: `%${title}%` }
        if (code && TypeTool.isNotEmptyString(code)) queryParams.where['code'] = { [Op.like]: `%${code}%` }
        if (status && TypeTool.isNotEmptyString(status)) queryParams.where['status'] = status
        if (isProduct && TypeTool.isNotEmptyString(isProduct)) queryParams.where['isProduct'] = isProduct
        if (productId && TypeTool.isNotEmptyString(productId)) queryParams.where['productId'] = { [Op.like]: `%${productId}%` }
        if (productStatus && TypeTool.isNotEmptyString(productStatus)) queryParams.where['productStatus'] = productStatus

        const files = await ExportVideoFile.findAndCountAll({
            distinct: "exportId",
            ...queryParams,
            limit: +take,
            offset: (+page - 1) * +take,
            order: [["id", "DESC"]],

        });

        for (let i = 0; i < files.rows.length; i++) {
            const row = files.rows[i]
            const dataValues = row.dataValues
            dataValues.lastRush = (await ExportRushLog.findOne({
                where: {
                    type: "data",
                    exportId: dataValues.id
                },
                order: [['createdAt', 'DESC']]
            }))

            let downloadUrl = ""
            const zipPath = this.getPathZipFile(dataValues.code)
            if (dataValues.status == 'complete' && fs.existsSync(zipPath)) {
                downloadUrl = await this.getExportFileDownloadUrl(dataValues.id)
            }
            dataValues.downloadUrl = downloadUrl

            row.dataValues = dataValues

            files.rows[i] = row

        }

        return files
    }


    async generateExportCode() {
        let code = "" 
        do {
            code =  generateRandomCode(10).toString()
            const findCode = await ExportVideoFile.findOne({ where: { code }, paranoid: false })
            if (!findCode) {
                break
            }else{
                console.log(2222222222, 'generate export file code, code is found', findCode)
            }
      
        } while (true)
        return code
    }

    async getFile(id) {
        const file = await ExportVideoFile.findOne({ where: { id }, include: 'detail' });
        if (!file) {
            throw ErrorResult.notFound("file is not found")
        }
        return file
    }

    async createExportVideos(userId, body, query) {
        let { templateId, videosId, isProduct, isExcludeMode } = body

        const template = await this.videoTemplateService.getById(templateId)


        let videosItems = null
        if (isExcludeMode) {
            ({ videoDetails: videosItems } = (await this.videoDetailService.specialVideoDetailList({ excludesId: videosId, ...query, page: 1, take: null })))
        } else {
            videosItems = await this.videoDetailService.getByVideoIds(videosId)
        }

        for (const videoDetail of videosItems) {


            const videoId = videoDetail.videoFileId
            const code = await this.generateExportCode();
            const exportFile = await ExportVideoFile.create({
                title: videoDetail.title.slice(0, 255),
                userId,
                isProduct,
                bitrate: template.bitrate,
                qualityExport: template.quality,
                isMute: template.isMute,
                code,
                logoParams: template.logoParams,
                textParams: template.textParams,
                gifTime: template.gifTime,
                status: 'queue',
            });


            await ExportVideoDetail.create({ videoId, shotId: null, bitrate: template.bitrate, startCutTime: null, endCutTime: null, exportId: exportFile.id, status: 'queue' })
        }

    }

    async createExportShots(userId, body, query) {
        const { templateId, shotsId, isProduct, isExcludeMode } = body

        const template = await this.videoTemplateService.getById(templateId)

        let shotsItems = null
        if (isExcludeMode) {
            ({ shots: shotsItems } = (await this.shotExport.getSpecialShotList({ excludesId: shotsId, ...query, page: 1, take: null })))
        } else {
            shotsItems = await this.shotService.getByIds(shotsId)
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

    async createFiles(userId, body) {
        const params = []

        const { title, templateId, sources } = body

        const template = await this.videoTemplateService.getById(templateId)

        const code = await this.generateExportCode()
        const exportFile = await ExportVideoFile.create({
            title,
            userId,
            qualityExport: template.quality,
            isMute: template.isMute,
            bitrate: template.bitrate,
            code,
            logoParams: template.logoParams,
            textParams: template.textParams,
            gifTime: template.gifTime,
            status: 'queue'
        })

        for (const param of sources) {
            const { videoId, shotId, cut } = param
            const startCutTime = cut?.[0] ? Math.trunc(cut[0] * 1000) / 1000 : null
            const endCutTime = cut?.[1] ? Math.trunc(cut[1] * 1000) / 1000 : null

            params.push({ videoId, shotId, startCutTime, endCutTime, exportId: exportFile.id })
        }

        await ExportVideoDetail.bulkCreate(params)
    }

    async getExportFileDownloadUrl(id) {
        const file = await this.getById(id);
        if (!file) return null

        return this.generateDownloadLink(`exportFileLocation/${file.code}.zip`)
    }

    async getExportFileToShow(id) {
        const file = await this.getById(id);

        const path = this.getPathFileByCode(file.code)
        const size = fs.statSync(path).size;

        return { path, size };
    }

    getExportFileURL(exportFileId) {
        return `${appConfigs.APP_URL}/api/videoFile/export/getFileUrl/${exportFileId}`;
    }

    async getPathFileById(id) {
        const file = await this.getById(id)
        return this.getPathFileByCode(file.code)
    }

    getRootDir() {
        return path.join(__dirname, "..", "..", "..");
    }

    getPathOfFolder(code) {
        return path.join(this.getRootDir(), appConfigs.STORE_FOLDER_FROM_APP_ROOT, "exportFileLocation", code)
    }

    getPathZipFile(code) {
        return path.join(this.getRootDir(), appConfigs.STORE_FOLDER_FROM_APP_ROOT, "exportFileLocation", `${code}.zip`)
    }

    getPathFileByCode(code) {
        return path.join(this.getPathOfFolder(code), `${code}.mp4`)
    }


    async findExportFileById(arrayOfFileId = []) {
        // Assuming you have a model called Task
        const files = await ExportVideoFile.findAll({
            where: {
                id: {
                    [Op.in]: arrayOfFileId
                }
            }
        });

        return files
    }

    async getExportFilesByCodes(arrayOfFileCode = []) {
        return await ExportVideoFile.findAll({ where: { code: arrayOfFileCode } })
    }

    async getFirstByProductStatus(productStatus = 'queue', includeDetailRequired = true) {
        const queryParams = {
            where: { productStatus },
        }

        if (includeDetailRequired) {
            queryParams['include'] = 'detail'
        }

        return await ExportVideoFile.findOne(queryParams);
    }

    async getFirstExportByStatus(status = 'queue', includeDetailRequired = true) {
        const queryParams = {
            where: { status },
        }

        if (includeDetailRequired) {
            queryParams['include'] = 'detail'
        }

        return await ExportVideoFile.findOne(queryParams);
    }

    async getFirstImportantExportByStatus(status = 'queue', includeDetailRequired = true) {
        const queryParams = {
            where: { status, isImportant: 1 },
        }

        if (includeDetailRequired) {
            queryParams['include'] = 'detail'
        }

        return await ExportVideoFile.findOne(queryParams);
    }

    async setImportantExportFile(id, isImportant) {

        const exportFile = await this.getById(id)
        if (exportFile.status != 'queue') {
            throw ErrorResult.badRequest("فایل شما در صف تبدیل قرار ندارد")
        }

        console.log(33333, isImportant)
        if (isImportant != 0 && isImportant != 1) {
            throw ErrorResult.badRequest("مقادیر وارد شده معتبر نیست")
        }

        exportFile.isImportant = isImportant
        await exportFile.save()
    }


    async getFirstExportByProductStatus(productStatus = 'queue', includeDetailRequired = false) {
        const queryParams = {
            where: { productStatus, status: 'complete' },
        }

        if (includeDetailRequired) {
            queryParams['include'] = 'detail'
        }

        return await ExportVideoFile.findOne(queryParams);
    }

    async setProductStatusFromPending2Queue() {
        await ExportVideoFile.update({ status: 'queue' }, { where: { status: 'pending' } });
        console.log("Restart sending to file");
    }


    async getFirstFile2SendRush() {
        let file = await this.getFirstExportByProductStatus('pending')
        if (file) {
            errorLog("The rush processing is currently busy!!")
            return null
        }

        return await this.getFirstExportByProductStatus('queue')
    }

    async setFileProduct2Pending(exportFile) {
        exportFile.productStatus = 'pending'
        await exportFile.save()

        return exportFile
    }

    async setPendingExportFile(exportId, startTime = Date.now()) {
        return await ExportVideoFile.update(
            { status: 'pending', startTime }, // New values to set
            { where: { id: exportId } } // Conditions (e.g., based on `id`)
        );
    }

    async setErrorExportFile(exportId, endTime = Date.now()) {
        await ExportVideoFile.update(
            { status: 'error', endTime }, // New values to set
            { where: { id: exportId } } // Conditions (e.g., based on `id`)
        );
    }
    async setCompleteExportFile(exportId, endTime = Date.now()) {
        await ExportVideoFile.update(
            { status: 'complete', endTime }, // New values to set
            { where: { id: exportId } } // Conditions (e.g., based on `id`)
        );
    }

    async setLastCommandExportFile(id, lastCommand, startTime, endTime, lastPid) {
        const updateParams = {}
        if (lastCommand) {
            updateParams['lastCommand'] = lastCommand
        }

        if (startTime) {
            updateParams['startTimeLastCommand'] = startTime
        }

        if (endTime) {
            updateParams['endTimeLastCommand'] = endTime
        }

        if (lastPid) {
            updateParams['pid'] = lastPid
        }

        await ExportVideoFile.update(
            updateParams, // New values to set
            { where: { id } } // Conditions (e.g., based on `id`)
        );
    }
    async deleteFiles(exportCodes = []) {
        const exportFiles = await this.getExportFilesByCodes(exportCodes);
        for (const exportFile of exportFiles) {
            const file = exportFile.toJSON()
            if (exportFile) {
                const { code, pid } = file;
                if (pid) treeKill(+pid)
                const exportDir = this.getPathOfFolder(code);
                console.log(exportDir)
                if (fs.existsSync(exportDir)) {
                    try {
                        fs.rmdirSync(exportDir, { recursive: true });
                    }
                    catch (err) {
                        logError("remove export file", err, "exportFile")
                    }
                }
                if (fs.existsSync(exportDir + ".zip")) {
                    try {
                        fs.unlinkSync(exportDir + ".zip");
                    }
                    catch (err) {
                        logError("remove export file", err, "exportFile")
                    }
                }

                await exportFile.destroy();
            }
        }

    }

    // detail functions =============================================
    async getDetailById(id) {
        return await ExportVideoDetail.findOne({ where: { id } })
    }

    async findAllDetailByExportId(exportId) {
        return await ExportVideoDetail.findAll({
            where: { exportId },
            include: [{
                model: ExportVideoFile,
                attributes: ['id', 'isProduct', 'productId', 'code', 'productStatus'],
                as: 'export'
            }
            ]
        })
    }

    async setPendingDetail(id) {
        return await ExportVideoDetail.update(
            { status: 'pending' }, // New values to set
            { where: { id } } // Conditions (e.g., based on `id`)
        );
    }

    async setErrorDetail(id) {
        await ExportVideoDetail.update(
            { status: 'error' }, // New values to set
            { where: { id } } // Conditions (e.g., based on `id`)
        );
    }

    async setCompleteDetail(id) {
        await ExportVideoDetail.update(
            { status: 'complete' }, // New values to set
            { where: { id } } // Conditions (e.g., based on `id`)
        );
    }

    async setLastCommandDetailFile(id, lastCommand, startTime, endTime, lastPid) {
        const updateParams = { pid: lastPid }
        if (lastCommand) {
            updateParams['lastCommand'] = lastCommand
        }

        if (startTime) {
            updateParams['startTimeLastCommand'] = startTime
        }

        if (endTime) {
            updateParams['endTimeLastCommand'] = endTime
        }

        await ExportVideoDetail.update(
            updateParams, // New values to set
            { where: { id } } // Conditions (e.g., based on `id`)
        );
    }

    async updateProductStatusByCode(productId, exportCode, status) {
        await ExportVideoFile.update({ productId, productStatus: status, isProduct: 1 }, { where: { code: exportCode } })
    }


    async setExportCodesProduct2Queue(codes) {
        await ExportVideoFile.update({ productStatus: 'queue' }, { where: { code: codes } })
    }


    async destroyDetail(id) {
        const detail = await ExportVideoDetail.findOne({ where: { id } });
        await detail.destroy()

        return true
    }


    async getShotsOfExport(exportId, filters = {}) {
        const exportShotsData = await this.findAllDetailByExportId(exportId)
        const exportShots = exportShotsData.map(item => item.toJSON())
        let shotsId = []
        for (const eShot of exportShots) {
            const { shotId } = eShot
            if (shotId) shotsId.push(shotId)
        }
        return await this.shotService.shotList({ ...filters, id: shotsId })
    }

    async modifyFile(exportId, reSend = true) {
        const detailsData = await this.findAllDetailByExportId(exportId)
        const exportDetails = detailsData.map(item => item.toJSON());
        const { isProduct } = exportDetails[0].export;
        const shotsId = exportDetails.filter(x => !!x.shotId).map(x => x.shotId)

        const shots = (await this.shotService.getByIds(shotsId)).map(x => x.toJSON())

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

    async CheckExistFileToExport() {
        return new Promise(async (resolve, reject) => {
            const firstPending = await this.getFirstExportByStatus('pending')
            console.log(3333333333, firstPending?.toJSON())
            if (firstPending) {
                return reject()
            }

            let file = await this.getFirstImportantExportByStatus('queue')
            if (!file)
                file = await this.getFirstExportByStatus('queue')

            if (!file) {
                return reject()
            }

            try {
                await this.videoEditorService.init(file);
                emitter.emit('exportComplete', file.id, file.isProduct);
            }
            catch (err) {
                console.log(err);
            }

            return resolve();
        })
    }

    async setOnlyReBuild(exportId) {
        await Redis.set(`onlyReBuild_${exportId}`, "true");
    }

    async checkAndRemoveOnlyReBuildStudio(exportId) {
        const check = await Redis.get(`onlyReBuild_${exportId}`);
        if (check) {
            await Redis.del(`onlyReBuild_${exportId}`);
            return true;
        }

        return false;
    }
}

module.exports = ExportVideoService;
