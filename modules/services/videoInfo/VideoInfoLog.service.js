const Service = require("../../_default/service");
const { VideoDetailLog, sequelize } = require("../../_default/model");
const { Op, QueryTypes } = require("sequelize");
const { createPaginationQuery } = require("../../../helper/SqlHelper.tool");

class VideoInfoLogService extends Service {
    constructor() {
        super(VideoDetailLog);
    }

    async getLogList(videoFileId, query = {}) {
        const page = query.page || 1
        const take = query.take || null
        const userId = query.userId
        const projectId = query.projectId
        const mode = query.mode

        let sqlQuery = { where: { videoFileId } }

        if (userId) {
            sqlQuery.where.userId = userId
        }

        // if (projectId) {
        //     sqlQuery.where.projectId = projectId
        // }

        if (mode) {
            sqlQuery.where.mode = mode
        }

        // if (startTime && !endTime) {
        //     endTime = Date.now()
        // }

        // if (startTime && endTime) {
        //     sqlQuery.where.from = {
        //         $between: [startTime, endTime]
        //     }
        // }


        sqlQuery = createPaginationQuery(sqlQuery, page, take);


        const logs = await VideoDetailLog.findAndCountAll({
            distinct: "videoFileId",
            ...sqlQuery

        });

        return logs
    }

    async createLog({ videoFileId, userId, body }) {
        const startTime = body.startTime
        const endTime = body.endTime
        const mode = body.mode || 'create'
        const cleaningDescription = body.cleaningDescription

        const videoDetailLog = await VideoDetailLog.create({ videoFileId, userId, startTime, endTime, mode, cleaningDescription })
        return videoDetailLog
    }

    async getLogs(filters = {}) {
        const {
            isProjectBase = false,
            projectId,
            userId,
            fromTime,
            toTime
        } = filters

        let query = `SELECT 
        video_detail_log."startTime" as "startTimeLog",
        video_detail_log."endTime" as "endTimeLog",
        video_detail_log.id as "videoDetailLogId",
        video_detail_log."userId" as "userLogId",
        video_detail_log.mode as mode,
        video_detail.title as "videoDetailTitle",
        video_detail."userId" as "userId",
        video_detail."videoFileId" as "videoFileId", 
        video_detail."projectId" as "projectId"
        FROM video_detail_log left join video_detail on video_detail_log."videoFileId" = video_detail."videoFileId"`

        let where = []
        const replacements = {}
        if (projectId) {
            where.push('video_detail."projectId" = :projectId')
            replacements['projectId'] = projectId
        }

        if (isProjectBase) {
            where.push('video_detail."projectId" is not null')
        }

        if (userId) {
            where.push('video_detail_log."userId" = :userId')
            replacements['userId'] = userId
        }

        if (fromTime && toTime) {
            where.push('video_detail_log."startTime" BETWEEN :fromTime and :toTime')
            replacements['fromTime'] = fromTime
            replacements['toTime'] = toTime
        }
        else if (fromTime && !toTime) {
            where.push('video_detail_log."startTime" >= :fromTime ')
            replacements['fromTime'] = fromTime
        }
        else if (!fromTime && toTime) {
            where.push('video_detail_log."startTime" <= :toTime ')
            replacements['toTime'] = toTime
        }

        if (where.length) {
            query += ' where ' + where.join(' and ')
        }

        return await sequelize.query(query, { replacements, type: QueryTypes.SELECT });
    }
}

module.exports = VideoInfoLogService;