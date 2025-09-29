const Service = require("../../_default/service");
const { ShotLog, Shot, User, sequelize } = require("../../_default/model");
const { Op, QueryTypes } = require("sequelize");
const moment = require("jalali-moment");
// const ShotService = require("./Shot.service");
const { videoFileService } = require("../../services/videoFile");
const EqualizerService = require("../../services/shotList/Equalizer.service")
const UserService = require("../../services/user/User.service");
const TypeTool = require("../../../helper/type.tool");
const path = require('path')
const fs = require('fs');
const { secondToTimeFormat, sizeToFormat, generateRandomCode } = require("../../../helper/general.tool");
const writeXlsxFile = require('write-excel-file/node');
const { errorLog } = require("../../../helper/showLog");

class ShotLogService extends Service {

    constructor(
        ProjectService = () => { },
        VideoDetailLogService = () => { }
    ) {
        super(ShotLog);

        this.projectService = ProjectService;
        this.videoDetailLogService = VideoDetailLogService;

        this.equalizerService = new EqualizerService();

        this.folderToStore = "excel"
        this.fullPathToStore = path.join(__dirname, '..', '..', '..', appConfigs.STORE_FOLDER_FROM_APP_ROOT, this.folderToStore);
        if (!fs.existsSync(this.fullPathToStore)) {
            fs.mkdirSync(this.fullPathToStore, { recursive: true });
        }
    }

    async specificDayLogReport(query = {}) {
        let { projectId, userId, time } = query

        const toTime = time + (24 * 60 * 60 * 1000)
        const shotLogs = await this.getShotLogs({
            projectId,
            userId,
            fromTime: time,
            toTime
        });


        // if (shotLogs.length === 0) {
        //     return [];
        // }


        // const videosId = shotLogs.map(x => x.videoFileId)
        // // ***************************** changes
        // const videoDetailLogs = (await this.videoDetailLogService.getVideoDetailLogList(videosId, { projectId, userId })).rows
        // // *****************************

        const result = [];

        for (const item of shotLogs) {
            const { shotId, endTimeLog, startTimeLog, shotTitle, mode, userLogId, videoFileId } = item;

            // // ***************************** changes
            // const videoDetailSpendTime =
            //     (videoDetailLogs.filter(x => x.videoFileId == videoFileId).
            //         reduce((acc, detailLog) => acc + ((+detailLog.endTime - +detailLog.startTime)), 0)) / 1000

            // const spentTime = (+(endTimeLog - startTimeLog) / (1000)) + videoDetailSpendTime;
            // ********************************
            const spentTime = (+(endTimeLog - startTimeLog) / (1000))

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


        const videoDetailLogs = await this.videoDetailLogService.getVideoDetailLogs({
            projectId,
            userId,
            fromTime: time,
            toTime
        })
        for (const item of videoDetailLogs) {
            const { videoFileId, startTimeLog, endTimeLog, mode, userLogId, videoDetailTitle } = item
            const spentTime = (+(endTimeLog - startTimeLog) / (1000))

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

        const userIds = result.map(x => x.user.id)
        const users = await UserService.getByIds(userIds);
        const userItems = users.map(x => x.toJSON())

        for (const data of result) {
            const findUser = userItems.find(x => x.id == data.user.id)
            data.user.fullName = findUser.fullName
        }

        return result
    }

    async exportExcelUserProjectsReport(userId, query = {}) {

        const { totalLog, groupArr } = await this.getUserProjectsReport(userId, query)

        const columns = [
            { value: 'ردیف', key: 'index' },
            { value: 'شناسه پروژه', key: 'projectId' },
            { value: 'عنوان پروژه', key: 'projectTitle' },

            { value: 'تعداد ویدئو ها', key: 'videoFilesCount' },
            { value: 'مدت زمان ویدئو ها', key: 'videoDuration' },
            { value: 'مجموع اندازه فایل ها', key: 'size' },
            { value: 'تعداد شات ها', key: 'shotCount' },
            { value: 'مدت زمان شات ها', key: 'shotDuration' },
            { value: 'مدت زمان کاربر', key: 'userSpentTime' },

            { value: 'تعداد نیم شات', key: 'initVideoDetailCount' },
            { value: 'زمان ویدیوهای نیم شات', key: 'initVideoDetailDuration' },
            { value: 'حجم ویدیوهای نیم شات', key: 'initVideoDetailSize' },
            { value: 'زمان کاربر نیم شات', key: 'initVideoDetailUserSpentTime' },

            { value: 'تعداد پاکسازی', key: 'cleaningVideoDetailCount' },
            { value: 'زمان ویدیوهای پاکسازی', key: 'cleaningVideoDetailDuration' },
            { value: 'حجم ویدیوهای پاکسازی', key: 'cleaningVideoDetailSize' },
            { value: 'زمان کاربر پاکسازی', key: 'cleaningVideoDetailUserSpentTime' },

            { value: 'تعداد شات کلی', key: 'createShotCount' },
            { value: 'زمان ویدیوهای شات کلی', key: 'createShotVideoDuration' },
            { value: 'حجم ویدیوهای شات کلی', key: 'createShotVideoSize' },
            { value: 'زمان شات های شات کلی', key: 'createShotShotDuration' },
            { value: 'زمان کاربر شات کلی', key: 'createShotUserSpentTime' },

            { value: 'تعداد آپدیت', key: 'updateShotCount' },
            { value: 'زمان ویدیوهای آپدیت', key: 'updateShotVideoDuration' },
            { value: 'حجم ویدیوهای آپدیت', key: 'updateShotVideoSize' },
            { value: 'زمان شات های آپدیت', key: 'updateShotShotDuration' },
            { value: 'زمان کاربر آپدیت', key: 'updateShotUserSpentTime' },

            { value: 'تعداد تدوین', key: 'editorShotCount' },
            { value: 'زمان ویدیوهای تدوین', key: 'editorShotVideoDuration' },
            { value: 'حجم ویدیوهای تدوین', key: 'editorShotVideoSize' },
            { value: 'زمان شات های تدوین', key: 'editorShotShotDuration' },
            { value: 'زمان کاربر تدوین', key: 'editorShotUserSpentTime' },

            { value: 'تعداد یکسانسازی', key: 'equalizingShotCount' },
            { value: 'زمان ویدیوهای یکسانسازی', key: 'equalizingShotVideoDuration' },
            { value: 'حجم ویدیوهای یکسانسازی', key: 'equalizingShotVideoSize' },
            { value: 'زمان شات های یکسانسازی', key: 'equalizingShotShotDuration' },
            { value: 'زمان کاربر یکسانسازی', key: 'equalizingShotUserSpentTime' },
        ];

        const createDataItem = (item, index) => {
            return [
                { type: String, value: `${index}`, key: 'index' },
                { type: String, value: TypeTool.string(item?.project?.id), key: 'projectId' },
                { type: String, value: TypeTool.string(item?.project?.title), key: 'projectTitle' },

                { type: String, value: TypeTool.string(item?.shotCount), key: 'shotCount' },
                { type: String, value: TypeTool.string(item?.videoFilesCount), key: 'videoFilesCount' },
                { type: String, value: secondToTimeFormat(item?.videoDuration), key: 'videoDuration' },
                { type: String, value: sizeToFormat(item?.size), key: 'size' },
                { type: String, value: secondToTimeFormat(item?.shotDuration), key: 'shotDuration' },
                { type: String, value: secondToTimeFormat(item?.userSpentTime), key: 'userSpentTime' },

                { type: String, value: TypeTool.string(item?.videoDetail?.init?.videoFilesCount), key: 'initVideoDetailCount' },
                { type: String, value: secondToTimeFormat(item?.videoDetail?.init?.duration), key: 'initVideoDetailDuration' },
                { type: String, value: secondToTimeFormat(item?.videoDetail?.init?.userSpentTime), key: 'initVideoDetailUserSpentTime' },
                { type: String, value: sizeToFormat(item?.videoDetail?.init?.size), key: 'initVideoDetailSize' },

                { type: String, value: TypeTool.string(item?.videoDetail?.cleaning?.videoFilesCount), key: 'cleaningVideoDetailCount' },
                { type: String, value: secondToTimeFormat(item?.videoDetail?.cleaning?.duration), key: 'cleaningVideoDetailDuration' },
                { type: String, value: secondToTimeFormat(item?.videoDetail?.cleaning?.userSpentTime), key: 'cleaningVideoDetailUserSpentTime' },
                { type: String, value: sizeToFormat(item?.videoDetail?.cleaning?.size), key: 'cleaningVideoDetailSize' },

                { type: String, value: TypeTool.string(item?.shot?.create?.shotsCount), key: 'createShotCount' },
                { type: String, value: secondToTimeFormat(item?.shot?.create?.videoDuration), key: 'createShotVideoDuration' },
                { type: String, value: secondToTimeFormat(item?.shot?.create?.shotDuration), key: 'createShotShotDuration' },
                { type: String, value: secondToTimeFormat(item?.shot?.create?.userSpentTime), key: 'createShotUserSpentTime' },
                { type: String, value: sizeToFormat(item?.shot?.create?.size), key: 'createShotVideoSize' },

                { type: String, value: TypeTool.string(item?.shot?.update?.shotsCount), key: 'updateShotCount' },
                { type: String, value: secondToTimeFormat(item?.shot?.update?.videoDuration), key: 'updateShotVideoDuration' },
                { type: String, value: secondToTimeFormat(item?.shot?.update?.shotDuration), key: 'updateShotShotDuration' },
                { type: String, value: secondToTimeFormat(item?.shot?.update?.userSpentTime), key: 'updateShotUserSpentTime' },
                { type: String, value: sizeToFormat(item?.shot?.update?.size), key: 'updateShotVideoSize' },

                { type: String, value: TypeTool.string(item?.shot?.editor?.shotsCount), key: 'editorShotCount' },
                { type: String, value: secondToTimeFormat(item?.shot?.editor?.videoDuration), key: 'editorShotVideoDuration' },
                { type: String, value: secondToTimeFormat(item?.shot?.editor?.shotDuration), key: 'editorShotShotDuration' },
                { type: String, value: secondToTimeFormat(item?.shot?.editor?.userSpentTime), key: 'editorShotUserSpentTime' },
                { type: String, value: sizeToFormat(item?.shot?.editor?.size), key: 'editorShotVideoSize' },

                { type: String, value: TypeTool.string(item?.shot?.equalizing?.shotsCount), key: 'equalizingShotCount' },
                { type: String, value: secondToTimeFormat(item?.shot?.equalizing?.videoDuration), key: 'equalizingShotVideoDuration' },
                { type: String, value: secondToTimeFormat(item?.shot?.equalizing?.shotDuration), key: 'equalizingShotShotDuration' },
                { type: String, value: secondToTimeFormat(item?.shot?.equalizing?.userSpentTime), key: 'equalizingShotUserSpentTime' },
                { type: String, value: sizeToFormat(item?.shot?.equalizing?.size), key: 'equalizingShotVideoSize' },
            ];
        }

        const totalItems = createDataItem(totalLog, "مجموع")

        const rows = [columns]
        const validTotalRows = []
        for (const h of columns) {
            const findItem = totalItems.find(x => x.key == h.key)
            if (findItem) {
                validTotalRows.push(findItem)
            }
        }
        rows.push(validTotalRows)
        rows.push([])
        rows.push([{ value: 'گزارش به تفکیک پروژه', span: columns.length, align: 'center' }])

        for (let i = 0; i < groupArr.length; i++) {
            const item = groupArr[i]
            const validProjectRows = []
            const projectItems = createDataItem(item, i + 1)
            for (const h of columns) {
                const findItem = projectItems.find(x => x.key == h.key)
                if (findItem) {
                    validProjectRows.push(findItem)
                }
            }

            rows.push(validProjectRows)
        }

        const fileName = Date.now() + generateRandomCode(5) + ".xlsx";
        const exportPath = path.join(this.fullPathToStore, fileName);
        await writeXlsxFile(rows, {
            filePath: exportPath
        });

        return {
            fileName,
            link: this.generateDownloadLink(`${this.folderToStore}/${fileName}`),
            path: path.join(this.fullPathToStore, fileName)
        }
    }

    async getUserProjectsReport(userId, query = {}) {
        const {
            totalLog,
            logDetailObj,
            videoFileAsObject
        } = await this.getTotalLogReport({ ...query, userId, isProjectBase: true })
        let groupArr = [];

        const projectIds = [...new Set(logDetailObj.map(item => item.projectId))];
        const projects = await this.projectService.getByIds(projectIds);

        if (logDetailObj.length > 0) {
            let group = {};

            for (const log of logDetailObj) {
                if (!group[log.projectId]) {
                    group[log.projectId] = [];
                }
                group[log.projectId].push(log);
            }

            for (const projectId in group) {
                const project = projects.find(item => item.id == projectId)
                let index = groupArr.push({
                    ...this.createTotalLogObject(group[projectId], videoFileAsObject),
                    project
                });

                groupArr[index - 1].workTimeEstimate = project.workTimeRatio * groupArr[index - 1].videoDuration;
                groupArr[index - 1].equalizeEstimate = project.equalizeRatio * groupArr[index - 1].videoDuration;
            }
        }

        return { totalLog, groupArr }
    }

    async exportExcelDailyReport(query = {}) {

        const { totalLog, groupArr } = await this.getDailyReport(query)

        const header = [
            { value: 'ردیف', key: 'index' },
            { value: 'تاریخ', key: 'date' },
            { value: 'تعداد ویدئو ها', key: 'videoFilesCount' },
            { value: 'مدت زمان ویدئو ها', key: 'videoDuration' },
            { value: 'مجموع اندازه فایل ها', key: 'size' },
            { value: 'تعداد شات ها', key: 'shotCount' },
            { value: 'مدت زمان شات ها', key: 'shotDuration' },
            { value: 'مدت زمان کاربر', key: 'userSpentTime' },

            { value: 'تعداد نیم شات', key: 'initVideoDetailCount' },
            { value: 'زمان ویدیوهای نیم شات', key: 'initVideoDetailDuration' },
            { value: 'حجم ویدیوهای نیم شات', key: 'initVideoDetailSize' },
            { value: 'زمان کاربر نیم شات', key: 'initVideoDetailUserSpentTime' },

            { value: 'تعداد پاکسازی', key: 'cleaningVideoDetailCount' },
            { value: 'زمان ویدیوهای پاکسازی', key: 'cleaningVideoDetailDuration' },
            { value: 'حجم ویدیوهای پاکسازی', key: 'cleaningVideoDetailSize' },
            { value: 'زمان کاربر پاکسازی', key: 'cleaningVideoDetailUserSpentTime' },

            { value: 'تعداد شات کلی', key: 'createShotCount' },
            { value: 'زمان ویدیوهای شات کلی', key: 'createShotVideoDuration' },
            { value: 'حجم ویدیوهای شات کلی', key: 'createShotVideoSize' },
            { value: 'زمان شات های شات کلی', key: 'createShotShotDuration' },
            { value: 'زمان کاربر شات کلی', key: 'createShotUserSpentTime' },

            { value: 'تعداد آپدیت', key: 'updateShotCount' },
            { value: 'زمان ویدیوهای آپدیت', key: 'updateShotVideoDuration' },
            { value: 'حجم ویدیوهای آپدیت', key: 'updateShotVideoSize' },
            { value: 'زمان شات های آپدیت', key: 'updateShotShotDuration' },
            { value: 'زمان کاربر آپدیت', key: 'updateShotUserSpentTime' },

            { value: 'تعداد تدوین', key: 'editorShotCount' },
            { value: 'زمان ویدیوهای تدوین', key: 'editorShotVideoDuration' },
            { value: 'حجم ویدیوهای تدوین', key: 'editorShotVideoSize' },
            { value: 'زمان شات های تدوین', key: 'editorShotShotDuration' },
            { value: 'زمان کاربر تدوین', key: 'editorShotUserSpentTime' },

            { value: 'تعداد یکسانسازی', key: 'equalizingShotCount' },
            { value: 'زمان ویدیوهای یکسانسازی', key: 'equalizingShotVideoDuration' },
            { value: 'حجم ویدیوهای یکسانسازی', key: 'equalizingShotVideoSize' },
            { value: 'زمان شات های یکسانسازی', key: 'equalizingShotShotDuration' },
            { value: 'زمان کاربر یکسانسازی', key: 'equalizingShotUserSpentTime' },
        ];

        const createDataItem = (item, index) => {
            return [
                { type: String, value: `${index}`, key: 'index' },
                { type: String, value: TypeTool.string(item?.date), key: 'date' },

                { type: String, value: TypeTool.string(item?.shotCount), key: 'shotCount' },
                { type: String, value: TypeTool.string(item?.videoFilesCount), key: 'videoFilesCount' },
                { type: String, value: secondToTimeFormat(item?.videoDuration), key: 'videoDuration' },
                { type: String, value: sizeToFormat(item?.size), key: 'size' },
                { type: String, value: secondToTimeFormat(item?.shotDuration), key: 'shotDuration' },
                { type: String, value: secondToTimeFormat(item?.userSpentTime), key: 'userSpentTime' },

                { type: String, value: TypeTool.string(item?.videoDetail?.init?.videoFilesCount), key: 'initVideoDetailCount' },
                { type: String, value: secondToTimeFormat(item?.videoDetail?.init?.duration), key: 'initVideoDetailDuration' },
                { type: String, value: secondToTimeFormat(item?.videoDetail?.init?.userSpentTime), key: 'initVideoDetailUserSpentTime' },
                { type: String, value: sizeToFormat(item?.videoDetail?.init?.size), key: 'initVideoDetailSize' },

                { type: String, value: TypeTool.string(item?.videoDetail?.cleaning?.videoFilesCount), key: 'cleaningVideoDetailCount' },
                { type: String, value: secondToTimeFormat(item?.videoDetail?.cleaning?.duration), key: 'cleaningVideoDetailDuration' },
                { type: String, value: secondToTimeFormat(item?.videoDetail?.cleaning?.userSpentTime), key: 'cleaningVideoDetailUserSpentTime' },
                { type: String, value: sizeToFormat(item?.videoDetail?.cleaning?.size), key: 'cleaningVideoDetailSize' },

                { type: String, value: TypeTool.string(item?.shot?.create?.shotsCount), key: 'createShotCount' },
                { type: String, value: secondToTimeFormat(item?.shot?.create?.videoDuration), key: 'createShotVideoDuration' },
                { type: String, value: secondToTimeFormat(item?.shot?.create?.shotDuration), key: 'createShotShotDuration' },
                { type: String, value: secondToTimeFormat(item?.shot?.create?.userSpentTime), key: 'createShotUserSpentTime' },
                { type: String, value: sizeToFormat(item?.shot?.create?.size), key: 'createShotVideoSize' },

                { type: String, value: TypeTool.string(item?.shot?.update?.shotsCount), key: 'updateShotCount' },
                { type: String, value: secondToTimeFormat(item?.shot?.update?.videoDuration), key: 'updateShotVideoDuration' },
                { type: String, value: secondToTimeFormat(item?.shot?.update?.shotDuration), key: 'updateShotShotDuration' },
                { type: String, value: secondToTimeFormat(item?.shot?.update?.userSpentTime), key: 'updateShotUserSpentTime' },
                { type: String, value: sizeToFormat(item?.shot?.update?.size), key: 'updateShotVideoSize' },

                { type: String, value: TypeTool.string(item?.shot?.editor?.shotsCount), key: 'editorShotCount' },
                { type: String, value: secondToTimeFormat(item?.shot?.editor?.videoDuration), key: 'editorShotVideoDuration' },
                { type: String, value: secondToTimeFormat(item?.shot?.editor?.shotDuration), key: 'editorShotShotDuration' },
                { type: String, value: secondToTimeFormat(item?.shot?.editor?.userSpentTime), key: 'editorShotUserSpentTime' },
                { type: String, value: sizeToFormat(item?.shot?.editor?.size), key: 'editorShotVideoSize' },

                { type: String, value: TypeTool.string(item?.shot?.equalizing?.shotsCount), key: 'equalizingShotCount' },
                { type: String, value: secondToTimeFormat(item?.shot?.equalizing?.videoDuration), key: 'equalizingShotVideoDuration' },
                { type: String, value: secondToTimeFormat(item?.shot?.equalizing?.shotDuration), key: 'equalizingShotShotDuration' },
                { type: String, value: secondToTimeFormat(item?.shot?.equalizing?.userSpentTime), key: 'equalizingShotUserSpentTime' },
                { type: String, value: sizeToFormat(item?.shot?.equalizing?.size), key: 'equalizingShotVideoSize' },
            ];
        }

        const totalItems = createDataItem(totalLog, "مجموع")

        const rows = [header]
        const validTotalRows = []
        for (const h of header) {
            const findItem = totalItems.find(x => x.key == h.key)
            if (findItem) {
                validTotalRows.push(findItem)
            }
        }
        rows.push(validTotalRows)
        rows.push([])
        rows.push([{ value: "گزارش به تفکیک روز", span: header.length, align: 'center' }])

        for (let i = 0; i < groupArr.length; i++) {
            const item = groupArr[i]
            const validDailyRows = []
            const dailyItems = createDataItem(item, i + 1)
            for (const h of header) {
                const findItem = dailyItems.find(x => x.key == h.key)
                if (findItem) {
                    validDailyRows.push(findItem)
                }
            }

            rows.push(validDailyRows)
        }

        const fileName = Date.now() + generateRandomCode(5) + ".xlsx";
        const exportPath = path.join(this.fullPathToStore, fileName);
        await writeXlsxFile(rows, {
            filePath: exportPath
        });

        return {
            fileName,
            link: this.generateDownloadLink(`${this.folderToStore}/${fileName}`),
            path: path.join(this.fullPathToStore, fileName)
        }
    }

    async getDailyReport(query = {}) {
        const {
            totalLog,
            logDetailObj,
            videoFileAsObject
        } = await this.getTotalLogReport(query)
        let groupArr = [];

        if (logDetailObj.length > 0) {
            let group = {};
            let minDate = +(logDetailObj[0]?.startTimeLog);
            let maxDate = +(logDetailObj[0]?.startTimeLog);

            for (const log of logDetailObj) {
                if (log.startTimeLog < minDate) minDate = +(log.startTimeLog);
                if (log.startTimeLog > maxDate) maxDate = +(log.startTimeLog);

                const date = moment(+log.startTimeLog).format("jYYYY/jMM/jDD");

                if (!group[date]) {
                    group[date] = [];
                }
                group[date].push(log);
            }

            for (const date in group) {
                groupArr.push({
                    ...this.createTotalLogObject(group[date], videoFileAsObject),
                    dateTime: group[date]?.[0]?.startTimeLog,
                    date,
                })
            }
        }

        return { totalLog, groupArr }
    }

    async getTotalLogReport(query = {}) {
        let { projectId, userId, fromTime, toTime, isProjectBase } = query;

        let logDetailObj = [];
        const videoFileAsObject = {};

        const shotLogs = await this.getShotLogs({ projectId, userId, fromTime, toTime, isProjectBase })
        const videoDetailLogs = await this.videoDetailLogService.getVideoDetailLogs({ projectId, userId, fromTime, toTime });

        const videosId = [...(new Set([...shotLogs.map(x => x.videoFileId), ...videoDetailLogs.map(x => x.videoFileId)]))];
        const videoFiles = await videoFileService.getByIds(videosId, ["id", "size", "duration"]);

        videoFiles.forEach(item => {
            videoFileAsObject[item.id] = item.toJSON();
        });

        const createLogObject = (item, type) => {
            return {
                type,
                mode: item.mode,

                date: moment(+item.startTimeLog).format("jYYYY/jMM/jDD"),
                userId: item.userLogId,
                shotId: item.shotId,
                videoFileId: item.videoFileId,
                projectId: item.projectId,

                startTimeLog: item.startTimeLog,
                endTimeLog: item.endTimeLog,
                userSpentTime: item.endTimeLog / 1000 - item.startTimeLog / 1000,
                shotDuration: (+item.shotEndTime - +item.shotStartTime)
            }
        }

        console.log(888888888, shotLogs.length, videoDetailLogs.length)

        for (const item of shotLogs) {
            logDetailObj.push(createLogObject(item, "shot"));
        }
        for (const item of videoDetailLogs) {
            logDetailObj.push(createLogObject(item, "videoDetail"));
        }

        let totalLog = this.createTotalLogObject(logDetailObj, videoFileAsObject)

        return {
            totalLog,
            logDetailObj,
            videoFileAsObject
        }
    }

    createTotalLogObject(logs, videoFileAsObject) {
        let totalLog = {
            userSpentTime: 0,

            videoFilesId: [],
            size: 0,
            videoDuration: 0,

            shotsId: [],
            shotDuration: 0,

            videoDetail: {
                videoFilesId: [],
                duration: 0,
                size: 0,
                userSpentTime: 0,

                init: { videoFilesId: [], duration: 0, size: 0, userSpentTime: 0 },
                cleaning: { videoFilesId: [], duration: 0, size: 0, userSpentTime: 0 },
            },
            shot: {
                videoFilesId: [],
                shotsId: [],
                shotDuration: 0,
                userSpentTime: 0,

                create: { videoFilesId: [], videoDuration: 0, size: 0, shotsId: [], shotDuration: 0, userSpentTime: 0 },
                update: { videoFilesId: [], videoDuration: 0, size: 0, shotsId: [], shotDuration: 0, userSpentTime: 0 },
                editor: { videoFilesId: [], videoDuration: 0, size: 0, shotsId: [], shotDuration: 0, userSpentTime: 0 },
                'init-check': { videoFilesId: [], videoDuration: 0, size: 0, shotsId: [], shotDuration: 0, userSpentTime: 0 },
                equalizing: { videoFilesId: [], videoDuration: 0, size: 0, shotsId: [], shotDuration: 0, userSpentTime: 0 },
            },
        }

        for (let i = 0; i < logs.length; i++) {
            const log = logs[i]
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

                // TODO
                if (totalLog.shot[log.mode]) {
                    totalLog.shot[log.mode].userSpentTime += log.userSpentTime;
                } else {
                    errorLog("createTotalLogObject", "index", i, log, totalLog.shot)
                }

                if (!totalLog.shot.shotsId.includes(log.shotId)) {
                    totalLog.shot.shotsId.push(log.shotId);
                    totalLog.shot.shotDuration += log.shotDuration;
                }
                if (totalLog.shot[log.mode] && !totalLog.shot[log.mode].shotsId.includes(log.shotId)) {
                    totalLog.shot[log.mode].shotsId.push(log.shotId);
                    totalLog.shot[log.mode].shotDuration += log.shotDuration;

                    if (!totalLog.shot[log.mode].videoFilesId.includes(log.videoFileId)) {
                        totalLog.shot[log.mode].videoFilesId.push(log.videoFileId);
                        totalLog.shot[log.mode].videoDuration += (+videoFileAsObject[log.videoFileId].duration);
                        totalLog.shot[log.mode].size += (+videoFileAsObject[log.videoFileId].size);
                    }
                }
            }
            else if (log.type === 'videoDetail') {
                const mainMode = ["accept", "reject"].includes(log.mode) ? "cleaning" : log.mode;

                totalLog.videoDetail.userSpentTime += (+log.userSpentTime);
                totalLog.videoDetail[mainMode].userSpentTime += (+log.userSpentTime);

                if (!totalLog.videoDetail.videoFilesId.includes(log.videoFileId)) {
                    totalLog.videoDetail.videoFilesId.push(log.videoFileId);
                    totalLog.videoDetail.duration += (+videoFileAsObject[log.videoFileId].duration);
                    totalLog.videoDetail.size += (+videoFileAsObject[log.videoFileId].size);
                }

                if (!totalLog.videoDetail[mainMode].videoFilesId.includes(log.videoFileId)) {
                    totalLog.videoDetail[mainMode].videoFilesId.push(log.videoFileId);
                    totalLog.videoDetail[mainMode].duration += (+videoFileAsObject[log.videoFileId].duration);
                    totalLog.videoDetail[mainMode].size += (+videoFileAsObject[log.videoFileId].size);
                }
            }
        }

        totalLog.videoFilesCount = totalLog.videoFilesId.length;
        totalLog.shotCount = totalLog.shotsId.length;

        totalLog.videoDetail.videoFilesCount = totalLog.videoDetail.videoFilesId.length;
        totalLog.shot.videoFilesCount = totalLog.shot.videoFilesId.length;
        totalLog.shot.shotsCount = totalLog.shot.shotsId.length;

        totalLog.videoDetail.init.videoFilesCount = totalLog.videoDetail.init.videoFilesId.length;
        totalLog.videoDetail.cleaning.videoFilesCount = totalLog.videoDetail.cleaning.videoFilesId.length;

        totalLog.shot.create.shotsCount = totalLog.shot.create.shotsId.length;
        totalLog.shot.update.shotsCount = totalLog.shot.update.shotsId.length;
        totalLog.shot.editor.shotsCount = totalLog.shot.editor.shotsId.length;
        totalLog.shot.equalizing.shotsCount = totalLog.shot.equalizing.shotsId.length;

        delete totalLog.videoFilesId;
        delete totalLog.shotsId;
        delete totalLog.videoDetail.videoFilesId;
        delete totalLog.shot.videoFilesId;
        delete totalLog.videoDetail.init.videoFilesId;
        delete totalLog.videoDetail.cleaning.videoFilesId;

        delete totalLog.shot.create.shotsId;
        delete totalLog.shot.update.shotsId;
        delete totalLog.shot.editor.shotsId;
        delete totalLog.shot.equalizing.shotsId;

        return totalLog;
    }

    async getShoteReport(filters = {}) {
        let {
            userId,
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
                    { startTime: { [Op.gte]: fromTime } },
                    { startTime: { [Op.lte]: toTime } },
                ]
            },
            include: [{
                model: User,
                attributes: ['id', 'fullName'],
                as: 'user'
            }],
            attributes: ["id", "startTime", "endTime"],
        }

        if (userId !== null) {
            query.where.userId = userId
        }

        let dbResponse = await ShotLog.findAll(query);

        if (dbResponse.length === 0) {
            return [];
        }

        let minDate = parseInt(dbResponse[0]?.startTime);
        let maxDate = parseInt(dbResponse[0]?.startTime);

        let shotObj = {};
        dbResponse.forEach(item => {
            if (item.startTime < minDate) minDate = parseInt(item.startTime);
            if (item.startTime > maxDate) maxDate = parseInt(item.startTime);

            let date = moment(parseInt(item.startTime)).format("jYYYY/jMM/jDD");
            if (!shotObj[date]) {
                shotObj[date] = {
                    spentTime: 0,
                    count: 0
                }
            }

            shotObj[date].timestamp = item.startTime;
            shotObj[date].spentTime += parseInt((item.endTime - item.startTime) / (1000 * 60));
            shotObj[date].count += 1;

        });

        while (1) {
            let date = moment(minDate).format("jYYYY/jMM/jDD");
            if (!shotObj[date]) {
                shotObj[date] = {
                    spentTime: 0,
                    count: 0,
                }
            }
            shotObj[date].timestamp = minDate;

            minDate += 24 * 60 * 60 * 1000;
            if (minDate > maxDate) {
                break;
            }
        }

        let shotData = Object.keys(shotObj).map(key => ({ time: key, ...shotObj[key] })).sort((a, b) => a.timestamp - b.timestamp);

        return shotData;
    }

    async getShotLogs(filters = {}) {
        const {
            isProjectBase = false,
            projectId,
            userId,
            fromTime,
            toTime
        } = filters

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
        FROM shot_log left join shots on shot_log."shotId" = shots.id`

        let where = []
        const replacements = {}
        if (projectId) {
            where.push('shots."projectId" = :projectId')
            replacements['projectId'] = projectId
        }

        if (isProjectBase) {
            where.push('shots."projectId" is not null')
        }

        if (userId) {
            where.push('shot_log."userId" = :userId')
            replacements['userId'] = +userId
        }

        if (fromTime && toTime) {
            where.push('shot_log."startTime" BETWEEN :fromTime and :toTime')
            replacements['fromTime'] = fromTime
            replacements['toTime'] = toTime
        }
        else if (fromTime && !toTime) {
            where.push('shot_log."startTime" >= :fromTime ')
            replacements['fromTime'] = fromTime
        }
        else if (!fromTime && toTime) {
            where.push('shot_log."startTime" <= :toTime ')
            replacements['toTime'] = toTime
        }

        if (where.length) {
            query += ' where ' + where.join(' and ')
        }

        return await sequelize.query(query, { replacements, type: QueryTypes.SELECT });
    }

    async getByShotsId(shotsId = []) {
        const shotLogs = await ShotLog.findAll({
            where: {
                shotId: {
                    [Op.in]: shotsId,
                },
            },
        });


        return shotLogs

    }

    async getShotLogList(shotId, query) {
        const page = query.page || 1
        const take = query.take || 10
        const userId = query.userId
        const mode = query.mode

        const queryParams = { where: { shotId } }

        if (userId) {
            queryParams.where.userId = userId
        }

        if (mode) {
            queryParams.where.mode = mode
        }

        // if (startTime && !endTime) {
        //     endTime = Date.now()
        // }

        // if (startTime && endTime) {
        //     queryParams.where.from = {
        //         $between: [startTime, endTime]
        //     }
        // }

        const logs = await ShotLog.findAndCountAll({
            distinct: "shotId",
            ...queryParams,
            limit: +take,
            offset: (+page - 1) * +take,
        });


        return logs
    }

    async createShotLog({ shotId, userId, body }) {
        const startTime = body.startTime
        const endTime = body.endTime
        const mode = body.mode || 'create'

        await ShotLog.create({ shotId, userId, startTime, endTime, mode })
    }
}

module.exports = ShotLogService;