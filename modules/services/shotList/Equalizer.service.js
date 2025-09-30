const moment = require("jalali-moment");
const { Op, Sequelize, sequelize } = require('sequelize');

const { EqualizerLog, User, Shot, Project } = require("../../_default/model");
const ErrorResult = require('../../../helper/error.tool');
const { createPaginationQuery } = require("../../../helper/SqlHelper.tool");
const { getTagsByIds } = require("../tag/Tag.service");
const { getDetailOfFolder, getVideoFileURL } = require('../videoFile/VideoFile.service');
const { setEqualizingResultInShot, getById: getShotById } = require('./Shot.service');
const emitter = require("../../_default/eventEmitter");

const listProjectVideoFilesForEqualizing = async (filters = {}) => {
    const { projectId, reqPath = "" } = filters;

    let videoFiles = await getDetailOfFolder({
        projectId,
        reqPath,
        shotDetail: true,
    });

    return videoFiles.map(item => {
        if (item.isFile) {
            const detail = item.detail.toJSON();
            detail.shotNotEqualize = detail.shots.filter(shot => !shot.lastEqualizeLogId).length;
            item.detail = detail;
        }
        return item;
    });
};

const listEqualizerLogs = async (filters = {}) => {
    const { page = null, take = null, userId, status, projectId, videoFileId } = filters;

    let sqlQuery = {
        where: { endTime: { [Op.not]: null } },
        include: [
            {
                model: User,
                attributes: ['id', 'fullName'],
                as: 'user'
            },
            {
                model: Shot,
                required: true,
                attributes: ["id", "title", "videoFileId", "userId", "projectId"],
                as: "shot",
                include: [
                    { model: Project, attributes: ['id', 'title'], as: 'project' },
                    { model: User, attributes: ['id', 'fullName'], as: 'user' }
                ]
            }
        ],
        attributes: ["id", "status", "description", "endTime", "startTime"],
        order: [['endTime', 'DESC'], ['id', 'DESC']],
    };

    if (userId) sqlQuery.where.userId = userId;
    if (status) sqlQuery.where.status = status;
    if (projectId) sqlQuery.include[1].where = { ...sqlQuery.include[1].where, projectId };
    if (videoFileId) sqlQuery.include[1].where = { ...sqlQuery.include[1].where, videoFileId };

    sqlQuery = createPaginationQuery(sqlQuery, page, take);

    const response = await EqualizerLog.findAndCountAll({ distinct: "shotId", ...sqlQuery });

    response.rows = response.rows.map(item => {
        const plainItem = item.toJSON();
        plainItem.videoFileUrl = getVideoFileURL(plainItem.shot.videoFileId);
        return plainItem;
    });

    return {
        result: response.rows,
        count: response.count
    };
};

const getEqualizerLogsForShots = async ({ shotsId = [], fromTime = null, toTime = null, lastOneRequired = false }) => {
    return EqualizerLog.findAll({
        where: {
            endTime: { [Op.not]: null },
            shotId: shotsId
        },
        raw: true,
    });
};

const getEqualizerComparisonData = async (equalizeId) => {
    const equalize = await EqualizerLog.findByPk(equalizeId);
    if (!equalize) throw ErrorResult.notFound("Equalizer log not found");

    let newData = equalize.newData ? JSON.parse(equalize.newData) : {};
    let oldData = equalize.oldData ? JSON.parse(equalize.oldData) : {};

    const extractTagIds = (data) => [
        ...(data?.tagInput?.flatMap(item => item.tagIds.filter(tag => typeof tag === "number")) || []),
        ...(data?.tagInVideo?.map(item => item.tagId).filter(id => typeof id === 'number') || []),
    ];

    const tagIds = [...new Set([...extractTagIds(newData), ...extractTagIds(oldData)])];
    const existTags = (await getTagsByIds(tagIds)).map(item => item.toJSON());
    const tagMap = Object.fromEntries(existTags.map(tag => [tag.id, tag.tag]));

    const mapTags = (items = [], key = 'tagIds', isArray = true) => items.map(item => {
        if (isArray) {
            item[key] = item[key].map(tagId => (typeof tagId === 'number' ? tagMap[tagId] || "" : tagId));
        } else {
            if(typeof item[key] === 'number') item[key] = tagMap[item[key]] || "";
        }
        return item;
    });

    newData.tagInput = mapTags(newData.tagInput, 'tagIds', true);
    oldData.tagInput = mapTags(oldData.tagInput, 'tagIds', true);
    newData.tagInVideo = mapTags(newData.tagInVideo, 'tagId', false);
    oldData.tagInVideo = mapTags(oldData.tagInVideo, 'tagId', false);

    return { newData, oldData };
};

const startEqualizing = async (shotId, userId) => {
    const [equalizerLog, created] = await EqualizerLog.findOrCreate({
        where: { userId, shotId, endTime: null },
        defaults: { startTime: Date.now() }
    });

    if (!created) {
        equalizerLog.startTime = Date.now();
        await equalizerLog.save();
    }

    return equalizerLog;
};

const submitEqualizerResult = async (shotId, userId, body = {}) => {
    const { status, description, newData = {}, oldData = {} } = body;

    const equalizerLog = await EqualizerLog.findOne({ where: { userId, shotId, endTime: null } });
    if (!equalizerLog) throw ErrorResult.badRequest("Invalid Equalize Shot session");

    Object.assign(equalizerLog, {
        endTime: Date.now(),
        status,
        description,
        newData: JSON.stringify(newData),
        oldData: JSON.stringify(oldData),
    });

    await equalizerLog.save();
    await setEqualizingResultInShot(equalizerLog.shotId, { equalizingId: equalizerLog.id, status: equalizerLog.status });

    const shot = await getShotById(shotId);
    emitter.emit('equalizeSubmit', { ...equalizerLog.toJSON(), videoFileId: shot.videoFileId, projectId: shot.projectId });

    return equalizerLog;
};

const getEqualizerActivityReport = async (filters = {}) => {
    let { shots = [], fromTime, toTime } = filters;
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    fromTime = fromTime ?? (toTime ? toTime - oneWeek : now - oneWeek);
    toTime = toTime ?? (fromTime ? fromTime + oneWeek : now);

    const query = {
        where: {
            endTime: { [Op.not]: null },
            startTime: { [Op.between]: [fromTime, toTime] }
        },
        include: [{ model: User, attributes: ['id', 'fullName'], as: 'user' }],
        attributes: ["id", "status", "startTime", "endTime"],
    };

    if (shots.length) {
        query.where.shotId = { [Op.in]: shots };
    }

    const dbResponse = await EqualizerLog.findAll(query);
    if (!dbResponse.length) return [];

    const report = {};
    let minDate = Infinity, maxDate = -Infinity;

    dbResponse.forEach(item => {
        const startTime = parseInt(item.startTime);
        minDate = Math.min(minDate, startTime);
        maxDate = Math.max(maxDate, startTime);

        const date = moment(startTime).format("jYYYY/jMM/jDD");
        if (!report[date]) {
            report[date] = { confirm: 0, confirm_edit: 0, need_meeting: 0, spentTime: 0, timestamp: startTime };
        }

        report[date].spentTime += (item.endTime - item.startTime) / (1000 * 60); // in minutes
        report[date][item.status]++;
    });

    for (let d = moment(minDate); d.isSameOrBefore(moment(maxDate)); d.add(1, 'days')) {
        const date = d.format("jYYYY/jMM/jDD");
        if (!report[date]) {
            report[date] = { confirm: 0, confirm_edit: 0, need_meeting: 0, spentTime: 0, timestamp: d.valueOf() };
        }
    }

    return Object.keys(report).map(key => ({ time: key, ...report[key] })).sort((a, b) => a.timestamp - b.timestamp);
};

module.exports = {
    listProjectVideoFilesForEqualizing,
    listEqualizerLogs,
    getEqualizerLogsForShots,
    getEqualizerComparisonData,
    startEqualizing,
    submitEqualizerResult,
    getEqualizerActivityReport,
};