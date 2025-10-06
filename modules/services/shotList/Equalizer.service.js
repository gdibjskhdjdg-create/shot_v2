const Service = require("../../_default/service");
const moment = require("jalali-moment");

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const {
    EqualizerLog,
    User,
    Shot,
    Project,
    sequelize
} = require("../../_default/model");
const ErrorResult = require('../../../helper/error.tool');
const { createPaginationQuery } = require("../../../helper/SqlHelper.tool");
const KeywordService = require("../keyword/Keyword.service");
const emitter = require("../../_default/eventEmitter");

class EqualizerService extends Service {
    constructor(
        videoFileService = () => { },
        shotService = () => { }
    ) {
        super(EqualizerLog);
        this.videoFileService = videoFileService;
        this.shotService = shotService;

        // this.getEqualizeByShotsId = this.getEqualizeByShotsId.bind(this);
    }

    async getVideoFilesOfProjectPath(filters = {}) {
        const {
            projectId,
            reqPath = "",
        } = filters;

        let videoFiles = await this.videoFileService.getDetailOfFolder({
            projectId,
            reqPath,
            shotDetail: true,
        });

        videoFiles = videoFiles.map(item => {
            if (item.isFile) {
                const detail = item.detail.toJSON();
                detail.shotNotEqualize = detail.shots.filter(shot => !shot.lastEqualizeLogId).length;
                item.detail = detail;
            }
            return item;
        })

        return videoFiles;
    }

    async getEqualizeList(filters = {}) {
        const {
            page = null,
            take = null,
            userId,
            status,
            projectId,
            videoFileId,
        } = filters;

        let sqlQuery = {
            where: { endTime: { [Op.not]: null } },
            include: [{
                model: User,
                attributes: ['id', 'fullName'],
                as: 'user'
            }],
            attributes: ["id", "status", "description", "endTime", "startTime"],
            order: [['endTime', 'DESC'], ['id', 'DESC']],
        };

        const relationWithShot = {
            model: Shot,
            required: true,
            attributes: ["id", "title", "videoFileId", "userId", "projectId"],
            as: "shot",
            include: [
                {
                    model: Project,
                    attributes: ['id', 'title'],
                    as: 'project'
                },
                {
                    model: User,
                    attributes: ['id', 'fullName'],
                    as: 'user'
                }
            ]
        }

        if (userId) sqlQuery.where.userId = userId
        if (status) sqlQuery.where.status = status;

        if (projectId) {
            if (!relationWithShot.where) {
                relationWithShot.where = {};
            }
            relationWithShot.where.projectId = projectId;
        }
        if (videoFileId) {
            if (!relationWithShot.where) {
                relationWithShot.where = {};
            }
            relationWithShot.where.videoFileId = videoFileId;
        }

        sqlQuery.include.push(relationWithShot);

        sqlQuery = createPaginationQuery(sqlQuery, page, take);

        const response = await EqualizerLog.findAndCountAll({
            distinct: "shotId",
            ...sqlQuery
        });

        response.rows = response.rows.map(item => item.toJSON()).map(item => {
            item.videoFileUrl = this.videoFileService.getVideoFileURL(item.shot.videoFileId);
            return item;
        });

        return {
            result: response.rows,
            count: response.count
        };
    }

    async getEqualizeByShotsId({ shotsId = [], fromTime = null, toTime = null, lastOneRequired = false }) {
        const response = await EqualizerLog.findAll({
            where: {
                endTime: { [Op.not]: null },
                shotId: shotsId
            },
            raw: true,
        });

        return response
    }

    async getCompare(equalizeId) {
        const equalize = await this.getById(equalizeId);

        let newData = equalize.newData ? JSON.parse(equalize.newData) : {};
        let oldData = equalize.oldData ? JSON.parse(equalize.oldData) : {};

        let tagIds = [];
        newData?.tagInput?.forEach(item => {
            tagIds = tagIds.concat(item.tagIds.filter(tag => typeof tag === "number"));
        });
        oldData?.tagInput?.forEach(item => {
            tagIds = tagIds.concat(item.tagIds.filter(tag => typeof tag === "number"));
        });

        newData?.tagInVideo?.forEach(item => tagIds.push(item.tagId));
        oldData?.tagInVideo?.forEach(item => tagIds.push(item.tagId));

        tagIds = [...new Set(tagIds)];

        let existTags = await KeywordService.getKeywordByIds(tagIds);
        existTags = existTags.map(item => item.toJSON());

        const funcSetNewValuesOfTagInput = (tagInput = []) => {
            return tagInput?.map(item => {
                item.tagIds = item.tagIds.map(tag => {
                    if (typeof tag === "number") {
                        let selectedTag = existTags.find(it => it.id === tag);
                        tag = selectedTag?.tag ?? "";
                    }
                    return tag;
                })
                return item;
            });
        }
        newData.tagInput = funcSetNewValuesOfTagInput(newData?.tagInput);
        oldData.tagInput = funcSetNewValuesOfTagInput(oldData?.tagInput);

        const funcSetNewValuesOfTagInVideo = (tagInVideos = []) => {
            return tagInVideos.map(item => {
                if (typeof item.tagId === "number") {
                    let selectedTag = existTags.find(it => it.id === item.tagId);
                    item.tagId = selectedTag?.tag ?? "";
                }
                return item;
            })
        }
        newData.tagInVideo = funcSetNewValuesOfTagInVideo(newData?.tagInVideo);
        oldData.tagInVideo = funcSetNewValuesOfTagInVideo(oldData?.tagInVideo);

        return { newData, oldData }
    }

    async startEqualize(shotId, userId) {
        let equalizerLog = await EqualizerLog.findOne({
            where: {
                userId,
                shotId,
                endTime: null
            }
        });

        if (!equalizerLog) {
            try {
                equalizerLog = await EqualizerLog.create({
                    userId,
                    shotId,
                    startTime: Date.now()
                });

            }
            catch (err) {
                throw ErrorResult.badRequest("invalid shotId");
            }


        }
        else {
            equalizerLog.startTime = Date.now();
            await equalizerLog.save();
        }

        return;
    }

    async submitStatusEqualizeShot(shotId, userId, body = {}) {
        const {
            status,
            description,
            newData = {},
            oldData = {}
        } = body;

        const equalizerLog = await EqualizerLog.findOne({
            where: {
                userId,
                shotId,
                endTime: null,
            }
        });

        if (!equalizerLog) {
            throw ErrorResult.badRequest("invalid Equalize Shot");
        }

        equalizerLog.endTime = Date.now();
        equalizerLog.status = status;
        equalizerLog.description = description;
        equalizerLog.newData = JSON.stringify(newData);
        equalizerLog.oldData = JSON.stringify(oldData);

        await equalizerLog.save();

        await this.shotService.setEqualizingResultInShot(equalizerLog.shotId, { equalizingId: equalizerLog.id, status: equalizerLog.status });

        const shot = (await this.shotService.getById(shotId))
        emitter.emit('equalizeSubmit', { ...equalizerLog.toJSON(), videoFileId: shot.videoFileId, projectId: shot.projectId })

        return;
    }

    async getEqualizeReport(filters = {}) {
        let {
            shots = [],
            fromTime = null,
            toTime = null
        } = filters;

        const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
        if (fromTime === null && toTime === null) {
            toTime = Date.now();
            fromTime = toTime - millisecondsPerWeek;
        }
        else if (fromTime === null) {
            fromTime = toTime - millisecondsPerWeek;
        }
        else if (toTime === null) {
            toTime = fromTime + millisecondsPerWeek;
        }


        const query = {
            where: {
                endTime: { [Op.not]: null },
                [Op.and]: [
                    sequelize.where(
                        sequelize.cast(sequelize.col('startTime'), 'FLOAT'),
                        { [Op.gte]: fromTime }
                    ),
                    sequelize.where(
                        sequelize.cast(sequelize.col('startTime'), 'FLOAT'),
                        { [Op.lte]: toTime }
                    )
                ]
            },
            include: [{
                model: User,
                attributes: ['id', 'fullName'],
                as: 'user'
            }],
            attributes: ["id", "status", "startTime", "endTime"],
        }

        // if (userId !== null) {
        //     query.where.userId = userId
        // }

        if (shots.length) {
            query.where.shotId = { [Op.in]: shots }
        }

        console.log(999999999, query)

        let dbResponse = await EqualizerLog.findAll(query);

        if (dbResponse.length === 0) {
            return [];
        }

        let minDate = parseInt(dbResponse[0]?.startTime);
        let maxDate = parseInt(dbResponse[0]?.startTime);

        let equalizeObj = {};
        dbResponse.forEach(item => {
            if (item.startTime < minDate) minDate = parseInt(item.startTime);
            if (item.startTime > maxDate) maxDate = parseInt(item.startTime);

            let date = moment(parseInt(item.startTime)).format("jYYYY/jMM/jDD");
            if (!equalizeObj[date]) {
                equalizeObj[date] = {
                    confirm: 0,
                    confirm_edit: 0,
                    need_meeting: 0,
                    spentTime: 0
                }
            }

            equalizeObj[date].timestamp = item.startTime;
            equalizeObj[date].spentTime += parseInt((item.endTime - item.startTime) / (1000 * 60));

            equalizeObj[date][item.status]++;
        });

        while (1) {
            let date = moment(minDate).format("jYYYY/jMM/jDD");
            if (!equalizeObj[date]) {
                equalizeObj[date] = {
                    confirm: 0,
                    confirm_edit: 0,
                    need_meeting: 0,
                    spentTime: 0
                }
            }
            equalizeObj[date].timestamp = minDate;

            minDate += 24 * 60 * 60 * 1000;
            if (minDate > maxDate) {
                break;
            }
        }

        let equalize = Object.keys(equalizeObj).map(key => ({ time: key, ...equalizeObj[key] })).sort((a, b) => a.timestamp - b.timestamp);

        return equalize;
    }
}

module.exports = EqualizerService;
