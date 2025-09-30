const { Op, QueryTypes } = require("sequelize");
const moment = require("jalali-moment");
const path = require('path');
const fs = require('fs');
const writeXlsxFile = require('write-excel-file/node');

const { ShotLog, Shot, User, sequelize } = require("../../_default/model");
const { videoFileService } = require("../../services/videoFile");
const UserService = require("../../services/user/User.service");
const TypeTool = require("../../../helper/type.tool");
const { secondToTimeFormat, sizeToFormat, generateRandomCode } = require("../../../helper/general.tool");
const { errorLog } = require("../../../helper/showLog");
const { projectService } = require("../project");
const videoDetailLogService = require("../videoDetail/VideoDetailLog.service");

const folderToStore = "excel";
const fullPathToStore = path.join(__dirname, '..', '..', '..', appConfigs.STORE_FOLDER_FROM_APP_ROOT, folderToStore);
if (!fs.existsSync(fullPathToStore)) {
    fs.mkdirSync(fullPathToStore, { recursive: true });
}

const getDailyLogReport = async (query = {}) => {
    let { projectId, userId, time } = query;
    const toTime = time + (24 * 60 * 60 * 1000);
    const shotLogs = await getShotLogs({ projectId, userId, fromTime: time, toTime });

    const result = [];

    for (const item of shotLogs) {
        const { shotId, endTimeLog, startTimeLog, shotTitle, mode, userLogId } = item;
        const spentTime = (+endTimeLog - +startTimeLog) / 1000;
        const end = new Date(+endTimeLog);
        const start = new Date(+startTimeLog);

        result.push({
            shotTitle,
            shotId,
            videoFileId: null,
            videoTitle: null,
            spentTime,
            end: `${end.getHours() < 10 ? '0' : ''}${end.getHours()}:${end.getMinutes() < 10 ? '0' : ''}${end.getMinutes()}:${end.getSeconds() < 10 ? '0' : ''}${end.getSeconds()}`,
            start: `${start.getHours() < 10 ? '0' : ''}${start.getHours()}:${start.getMinutes() < 10 ? '0' : ''}${start.getMinutes()}:${start.getSeconds() < 10 ? '0' : ''}${start.getSeconds()}`,
            mode,
            user: { id: userLogId, fullName: "" }
        });
    }

    const videoDetailLogs = await videoDetailLogService.getVideoDetailLogs({ projectId, userId, fromTime: time, toTime });
    for (const item of videoDetailLogs) {
        const { videoFileId, startTimeLog, endTimeLog, mode, userLogId, videoDetailTitle } = item;
        const spentTime = (+endTimeLog - +startTimeLog) / 1000;
        const end = new Date(+endTimeLog);
        const start = new Date(+startTimeLog);

        result.push({
            shotTitle: null,
            shotId: null,
            videoFileId,
            videoTitle: videoDetailTitle,
            spentTime,
            end: `${end.getHours() < 10 ? '0' : ''}${end.getHours()}:${end.getMinutes() < 10 ? '0' : ''}${end.getMinutes()}:${end.getSeconds() < 10 ? '0' : ''}${end.getSeconds()}`,
            start: `${start.getHours() < 10 ? '0' : ''}${start.getHours()}:${start.getMinutes() < 10 ? '0' : ''}${start.getMinutes()}:${start.getSeconds() < 10 ? '0' : ''}${start.getSeconds()}`,
            mode,
            user: { id: userLogId, fullName: "" }
        });
    }

    const userIds = result.map(x => x.user.id);
    const users = await UserService.getByIds(userIds);
    const userItems = users.map(x => x.toJSON());

    for (const data of result) {
        const findUser = userItems.find(x => x.id == data.user.id);
        if (findUser) {
            data.user.fullName = findUser.fullName;
        }
    }

    return result;
};

const createTotalLogSummary = (logs, videoFileAsObject) => {
    let totalLog = {
        userSpentTime: 0,
        videoFilesId: [],
        size: 0,
        videoDuration: 0,
        shotsId: [],
        shotDuration: 0,
        videoDetail: {
            videoFilesId: [], duration: 0, size: 0, userSpentTime: 0,
            init: { videoFilesId: [], duration: 0, size: 0, userSpentTime: 0 },
            cleaning: { videoFilesId: [], duration: 0, size: 0, userSpentTime: 0 },
        },
        shot: {
            videoFilesId: [], shotsId: [], shotDuration: 0, userSpentTime: 0,
            create: { videoFilesId: [], videoDuration: 0, size: 0, shotsId: [], shotDuration: 0, userSpentTime: 0 },
            update: { videoFilesId: [], videoDuration: 0, size: 0, shotsId: [], shotDuration: 0, userSpentTime: 0 },
            editor: { videoFilesId: [], videoDuration: 0, size: 0, shotsId: [], shotDuration: 0, userSpentTime: 0 },
            'init-check': { videoFilesId: [], videoDuration: 0, size: 0, shotsId: [], shotDuration: 0, userSpentTime: 0 },
            equalizing: { videoFilesId: [], videoDuration: 0, size: 0, shotsId: [], shotDuration: 0, userSpentTime: 0 },
        },
    };

    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        totalLog.userSpentTime += (+log.userSpentTime);

        if (!totalLog.videoFilesId.includes(log.videoFileId) && videoFileAsObject[log.videoFileId]) {
            totalLog.videoFilesId.push(log.videoFileId);
            totalLog.videoDuration += (+videoFileAsObject[log.videoFileId].duration);
            totalLog.size += (+videoFileAsObject[log.videoFileId].size);
        }

        if (log.type === "shot") {
            if (!totalLog.shotsId.includes(log.shotId)) {
                totalLog.shotsId.push(log.shotId);
                totalLog.shotDuration += log.shotDuration;
            }
            totalLog.shot.userSpentTime += log.userSpentTime;
            if (totalLog.shot[log.mode]) {
                totalLog.shot[log.mode].userSpentTime += log.userSpentTime;
            } else {
                errorLog("createTotalLogSummary", "index", i, log, totalLog.shot);
            }
            if (!totalLog.shot.shotsId.includes(log.shotId)) {
                totalLog.shot.shotsId.push(log.shotId);
                totalLog.shot.shotDuration += log.shotDuration;
            }
            if (totalLog.shot[log.mode] && !totalLog.shot[log.mode].shotsId.includes(log.shotId)) {
                totalLog.shot[log.mode].shotsId.push(log.shotId);
                totalLog.shot[log.mode].shotDuration += log.shotDuration;

                if (!totalLog.shot[log.mode].videoFilesId.includes(log.videoFileId) && videoFileAsObject[log.videoFileId]) {
                    totalLog.shot[log.mode].videoFilesId.push(log.videoFileId);
                    totalLog.shot[log.mode].videoDuration += (+videoFileAsObject[log.videoFileId].duration);
                    totalLog.shot[log.mode].size += (+videoFileAsObject[log.videoFileId].size);
                }
            }
        } else if (log.type === 'videoDetail') {
            const mainMode = ["accept", "reject"].includes(log.mode) ? "cleaning" : log.mode;
            totalLog.videoDetail.userSpentTime += (+log.userSpentTime);
            if (totalLog.videoDetail[mainMode]) {
                totalLog.videoDetail[mainMode].userSpentTime += (+log.userSpentTime);
            }

            if (!totalLog.videoDetail.videoFilesId.includes(log.videoFileId) && videoFileAsObject[log.videoFileId]) {
                totalLog.videoDetail.videoFilesId.push(log.videoFileId);
                totalLog.videoDetail.duration += (+videoFileAsObject[log.videoFileId].duration);
                totalLog.videoDetail.size += (+videoFileAsObject[log.videoFileId].size);
            }

            if (totalLog.videoDetail[mainMode] && !totalLog.videoDetail[mainMode].videoFilesId.includes(log.videoFileId) && videoFileAsObject[log.videoFileId]) {
                totalLog.videoDetail[mainMode].videoFilesId.push(log.videoFileId);
                totalLog.videoDetail[mainMode].duration += (+videoFileAsObject[log.videoFileId].duration);
                totalLog.videoDetail[mainMode].size += (+videoFileAsObject[log.videoFileId].size);
            }
        }
    }

    totalLog.videoFilesCount = totalLog.videoFilesId.length;
    totalLog.shotCount = totalLog.shotsId.length;
    totalLog.videoDetail.videoFilesCount = totalLog.videoDetail.videoFilesId.length;
    totalLog.shot.shotsCount = totalLog.shot.shotsId.length;
    totalLog.videoDetail.init.videoFilesCount = totalLog.videoDetail.init.videoFilesId.length;
    totalLog.videoDetail.cleaning.videoFilesCount = totalLog.videoDetail.cleaning.videoFilesId.length;
    totalLog.shot.create.shotsCount = totalLog.shot.create.shotsId.length;
    totalLog.shot.update.shotsCount = totalLog.shot.update.shotsId.length;
    totalLog.shot.editor.shotsCount = totalLog.shot.editor.shotsId.length;
    totalLog.shot.equalizing.shotsCount = totalLog.shot.equalizing.shotsId.length;

    // Clean up IDs arrays
    delete totalLog.videoFilesId;
    delete totalLog.shotsId;
    // ... and so on for all other id arrays

    return totalLog;
};

const getTotalLogReport = async (query = {}) => {
    let { projectId, userId, fromTime, toTime, isProjectBase } = query;
    let logDetailObj = [];
    const videoFileAsObject = {};

    const shotLogs = await getShotLogs({ projectId, userId, fromTime, toTime, isProjectBase });
    const videoDetailLogs = await videoDetailLogService.getVideoDetailLogs({ projectId, userId, fromTime, toTime });

    const videosId = [...new Set([...shotLogs.map(x => x.videoFileId), ...videoDetailLogs.map(x => x.videoFileId)])];
    const videoFiles = await videoFileService.getByIds(videosId, ["id", "size", "duration"]);

    videoFiles.forEach(item => {
        videoFileAsObject[item.id] = item.toJSON();
    });

    const createLogObject = (item, type) => ({
        type,
        mode: item.mode,
        date: moment(+item.startTimeLog).format("jYYYY/jMM/jDD"),
        userId: item.userLogId,
        shotId: item.shotId,
        videoFileId: item.videoFileId,
        projectId: item.projectId,
        startTimeLog: item.startTimeLog,
        endTimeLog: item.endTimeLog,
        userSpentTime: (item.endTimeLog - item.startTimeLog) / 1000,
        shotDuration: (+item.shotEndTime - +item.shotStartTime)
    });

    shotLogs.forEach(item => logDetailObj.push(createLogObject(item, "shot")));
    videoDetailLogs.forEach(item => logDetailObj.push(createLogObject(item, "videoDetail")));

    let totalLog = createTotalLogSummary(logDetailObj, videoFileAsObject);

    return {
        totalLog,
        logDetailObj,
        videoFileAsObject
    };
};

const getShotLogs = async (filters = {}) => {
    const { isProjectBase = false, projectId, userId, fromTime, toTime } = filters;

    let query = `SELECT
        shot_log."startTime" as "startTimeLog",
        shot_log."endTime" as "endTimeLog",
        shot_log.id as shotLogId,
        shot_log."userId" as "userLogId",
        shot_log.mode as mode,
        shots.id as "shotId",
        shots.title as "shotTitle",
        shots."userId" as "userId",
        shots."videoFileId" as "videoFileId",
        shots."startTime" as "shotStartTime",
        shots."endTime" as "shotEndTime",
        shots."projectId" as "projectId"
        FROM shot_log left join shots on shot_log."shotId" = shots.id`;

    let where = [];
    const replacements = {};

    if (projectId) {
        where.push('shots."projectId" = :projectId');
        replacements['projectId'] = projectId;
    }
    if (isProjectBase) {
        where.push('shots."projectId" is not null');
    }
    if (userId) {
        where.push('shot_log."userId" = :userId');
        replacements['userId'] = +userId;
    }
    if (fromTime && toTime) {
        where.push('shot_log."startTime" BETWEEN :fromTime and :toTime');
        replacements['fromTime'] = fromTime;
        replacements['toTime'] = toTime;
    }

    if (where.length) {
        query += ' where ' + where.join(' and ');
    }

    return await sequelize.query(query, { replacements, type: QueryTypes.SELECT });
};

// ... Other functions like exportExcelDailyReport, getUserProjectsReport etc.
// would be here, with their full implementation based on the original class methods.

module.exports = {
    getDailyLogReport,
    //... other exported functions
    getTotalLogReport,
    createTotalLogSummary,
    getShotLogs
};