const path = require('path')
const fs = require('fs');
const fsPromise = require('fs').promises;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const writeXlsxFile = require('write-excel-file/node');

const { Project, VideoFile } = require("../../_default/model");

const ErrorResult = require("../../../helper/error.tool");
const Service = require("../../_default/service");

const TypeTool = require("../../../helper/type.tool");
const { createPaginationQuery } = require('../../../helper/SqlHelper.tool');

const { videoFileService } = require('../../services/videoFile/index');
const UserService = require("../../services/user/User.service");

const { secondToTimeFormat, sizeToFormat, generateRandomCode } = require('../../../helper/general.tool');

class ProjectService extends Service {

    constructor(
        ShotLogService = () => { },
        ShotService = () => { },
        EqualizerService = () => { },
        VideoInfoLogService = () => { },
        VideoInfoService = () => { }
    ) {
        super(Project);
        this.shotLogService = ShotLogService;
        this.shotService = ShotService;
        this.equalizerService = EqualizerService;
        this.VideoInfoLogService = VideoInfoLogService;
        this.VideoInfoService = VideoInfoService;

        // this.folderToStore = "shotDetailExport"
        this.folderToStore = "excel"
        this.fullPathToStore = path.join(__dirname, '..', '..', '..', appConfigs.STORE_FOLDER_FROM_APP_ROOT, this.folderToStore);
        if (!fs.existsSync(this.fullPathToStore)) {
            fs.mkdirSync(this.fullPathToStore, { recursive: true });
        }
    }

    async getProjects(filters = {}) {
        const {
            id = null,
            page = null,
            take = null,
            userId = null,
            sortKey = null,
            sortACS = null,
            search = ""
        } = filters;

        let sqlQuery = {
            where: {},
            include: [],
            order: [["createdAt", "DESC"]]
        };

        if (id) sqlQuery.where.id = id;
        if (TypeTool.boolean(search)) sqlQuery.where.title = { [Op.like]: `%${TypeTool.string(search).trim()}%` }
        if (userId) {
            sqlQuery.distinct = true;
            sqlQuery.include.push({
                model: VideoFile,
                attributes: ['id', 'userId', 'shotCount', 'projectId'],
                where: { userId },
                as: 'videoFile',
            })
        }

        if (sortKey && sortACS) {
            sqlQuery.order = [[sortKey, sortACS]];
        }

        sqlQuery = createPaginationQuery(sqlQuery, page, take);

        const response = await Project.findAndCountAll({ ...sqlQuery });

        return {
            projects: response.rows,
            count: response.count
        };
    }

    async updateProjectStatus(projectId) {

        if (!projectId) {
            return;
        }

        const project = await this.getById(projectId)
        if (!project) {
            return;
        }

        const videoFiles = await videoFileService.getByAttribute("projectId", projectId);
        if (videoFiles.length == 0) {
            project.shotStatus = 'shotting';
            await project.save();
            return
        }


        let status = null;

        const videos = videoFiles.map(x => x.toJSON());

        const findShotZeroCount = videos.find(x => x.shotCount == 0);

        if (findShotZeroCount) {
            status = 'shotting';
        } else {
            const shotRows = await this.shotService.getByAttribute("projectId", projectId);
            if (shotRows.length == 0) {
                status = 'shotting';
            } else {
                const shots = shotRows.map(x => x.toJSON());
                const findShotHasNotEqualize = shots.find(x => !x.lastEqualizeLogId);
                status = findShotHasNotEqualize ? 'equalizing' : 'equalized';
            }
        }

        project.shotStatus = status;
        await project.save();

    }

    async exportExcelReportPerProject(query) {
        const { report: projects } = await this.reportPerProject({ ...query, page: 1, take: null })

        const header = [
            { value: 'ردیف' },
            { value: 'شناسه پروژه' },
            { value: 'عنوان پروژه' },
            { value: 'تعداد ویدئو ها' },
            { value: 'مدت زمان ویدئو ها	' },
            { value: 'زمان تخمین انجام' },
            { value: 'زمان تخمین یکسان سازی' },
            { value: 'مجموع اندازه فایل ها' },
            { value: 'تعداد ویدئو های بدون شات' },
            { value: 'تعداد شات ها' },
            { value: ' مدت زمان شات ها' },
            { value: 'مدت زمان کاربر' },

            { value: "تعداد نیم شات" },
            { value: "زمان کاربر برای نیم شات" },

            { value: "تعداد پاکسازی" },
            { value: "زمان کاربر برای پاکسازی" },

            { value: "تعداد تایید" },
            { value: "تعداد رد" },

            { value: "شات در حال بررسی" },
            { value: "شات در حال تدوین" },
            { value: "شات در حال یکسان سازی" },
            { value: "شات یکسان سازی شده" },
        ];


        const createdDataItem = (item, index) => {
            return [
                { type: String, value: `${index + 1}` },
                { type: String, value: TypeTool.string(item.project.id) },
                { type: String, value: item.project.title },
                { type: String, value: TypeTool.string(item.videoFilesCount) },
                { type: String, value: secondToTimeFormat(item?.videoDuration) },
                { type: String, value: secondToTimeFormat(item?.workTimeEstimate) },
                { type: String, value: secondToTimeFormat(item?.equalizeEstimate) },
                { type: String, value: sizeToFormat(item?.size) },
                { type: String, value: TypeTool.string(item?.notShot) },
                { type: String, value: TypeTool.string(item?.shotCount) },
                { type: String, value: secondToTimeFormat(item?.shotDuration) },
                { type: String, value: secondToTimeFormat(item?.userSpentTime) },

                { type: String, value: TypeTool.string(item?.videoDetail.initCount) },
                { type: String, value: secondToTimeFormat(item?.videoDetail.init.userSpentTime) },
                { type: String, value: TypeTool.string(item?.videoDetail.cleaningCount) },
                { type: String, value: secondToTimeFormat(item?.videoDetail.cleaning.userSpentTime) },
                { type: String, value: TypeTool.string(item?.videoDetail.acceptCount) },
                { type: String, value: TypeTool.string(item?.videoDetail.rejectCount) },
                { type: String, value: TypeTool.string(item?.shot.initCheckCount) },
                { type: String, value: TypeTool.string(item?.shot.editorCount) },
                { type: String, value: TypeTool.string(item?.shot.equalizingCount) },
                { type: String, value: TypeTool.string(item?.shot.equalizedCount) },
            ];
        }

        const rows = [header]
        for (let i = 0; i < projects.length; i++) {
            const project = projects[i]
            rows.push(createdDataItem(project, i))
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

    async reportPerProject(query) {
        let { projectId, userId, search, fromTime, toTime, page, take } = query

        const rows = []
        const { projects, count } = await this.getProjects({ id: projectId, search, userId, page, take })

        for (const project of projects) {
            const { totalLog, groupArr } = await this.userReportProject(project.id, { fromTime, toTime })

            const projectId = project.id
            const { videoFiles } = await videoFileService.getVideoFileList({ projectId });
            const { shots } = await this.shotService.shotList({ projectId });

            const videoItems = {
                durations: 0,
                size: 0,
                cleaningCount: 0,
                initCount: 0,
                acceptCount: 0,
                rejectCount: 0,
            };

            const shotStatusCounts = {
                initCheck: 0,
                editor: 0,
                equalizing: 0,
                equalized: 0,
            }

            videoFiles.forEach(file => {
                videoItems.size += (+file.size)
                videoItems.durations += (+file.duration)
                if (file?.videoDetail?.status === VideoInfoStatus_Enum.init.value) videoItems.initCount++;
                else if (file?.videoDetail?.status === VideoInfoStatus_Enum.cleaning.value) videoItems.cleaningCount++;
                else if (file?.videoDetail?.status === VideoInfoStatus_Enum.accept.value) videoItems.acceptCount++;
                else if (file?.videoDetail?.status === VideoInfoStatus_Enum.reject.value) videoItems.rejectCount++;
            });

            shots.forEach(shot => {
                if (shot.status === "init-check") shotStatusCounts.initCheck++;
                if (shot.status === "editor") shotStatusCounts.editor++;
                if (shot.status === "equalizing") shotStatusCounts.equalizing++;
                if (shot.status === "equalized") shotStatusCounts.equalized++;
            })

            totalLog.project = project;
            totalLog.videoDuration = videoItems.durations;
            totalLog.size = videoItems.size;
            totalLog.videoFilesCount = videoFiles.length;
            totalLog.shotCount = shots.length;

            totalLog.workTimeEstimate = project.workTimeRatio * videoItems.durations;
            totalLog.equalizeEstimate = project.equalizeRatio * videoItems.durations;

            totalLog.shotDuration = shots.reduce((acc, shot) => acc + ((+shot.endTime - +shot.startTime)), 0),

                totalLog.notShot = videoFiles.length - [...new Set(shots.map(item => item.videoFileId))].length;

            totalLog.videoDetail.cleaningCount = videoItems.cleaningCount;
            totalLog.videoDetail.initCount = videoItems.initCount;
            totalLog.videoDetail.acceptCount = videoItems.acceptCount;
            totalLog.videoDetail.rejectCount = videoItems.rejectCount;

            totalLog.shot.initCheckCount = shotStatusCounts.initCheck;
            totalLog.shot.editorCount = shotStatusCounts.editor;
            totalLog.shot.equalizingCount = shotStatusCounts.equalizing;
            totalLog.shot.equalizedCount = shotStatusCounts.equalized;

            rows.push(totalLog);
        }

        return { report: rows, count }
    }

    async exportExcelUserReportProject(projectId, query) {
        const { totalLog, groupArr } = await this.userReportProject(projectId, query)

        const columns = [
            { value: 'ردیف', key: 'index' },
            { value: 'شناسه کاربر', key: 'userId' },
            { value: 'نام کاربر', key: 'userName' },

            { value: 'تعداد ویدئو ها', key: 'videoFilesCount' },
            { value: 'مدت زمان ویدئو ها', key: 'videoDuration' },
            { value: 'مجموع اندازه فایل ها', key: 'size' },
            { value: 'تعداد شات ها', key: 'shotCount' },
            { value: 'مدت زمان شات ها', key: 'shotDuration' },
            { value: 'مدت زمان کاربر', key: 'userSpentTime' },

            { value: 'زمان تخمین انجام', key: 'workTimeEstimate' },
            { value: 'زمان تخمین یکسان سازی', key: 'equalizeEstimate' },

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
                { type: String, value: TypeTool.string(item?.userId), key: 'userId' },
                { type: String, value: TypeTool.string(item?.userName), key: 'userName' },

                { type: String, value: TypeTool.string(item?.shotCount), key: 'shotCount' },
                { type: String, value: TypeTool.string(item?.videoFilesCount), key: 'videoFilesCount' },
                { type: String, value: secondToTimeFormat(item?.workTimeEstimate), key: 'workTimeEstimate' },
                { type: String, value: secondToTimeFormat(item?.equalizeEstimate), key: 'equalizeEstimate' },
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
        rows.push([{ value: 'گزارش به تفکیک کاربر', span: columns.length, align: 'center' }])

        rows.push(columns)
        for (let i = 0; i < groupArr.length; i++) {
            const user = groupArr[i]
            const validUserRows = []
            const userItems = createDataItem(user, i + 1)
            for (const h of columns) {
                const findItem = userItems.find(x => x.key == h.key)
                if (findItem) {
                    validUserRows.push(findItem)
                }
            }

            rows.push(validUserRows)
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

    async userReportProject(projectId, query) {
        const {
            totalLog,
            logDetailObj,
            videoFileAsObject
        } = await this.shotLogService.getTotalLogReport({ ...query, projectId });
        let groupArr = [];

        const countOfVideo = await videoFileService.getCountOfVideoFile({ projectId });
        const countOfShotVideoDistinct = await this.shotService.countOfUniqueVideoFile({ projectId });
        const project = await this.getById(projectId);

        const userIds = [...new Set(logDetailObj.map(item => item.userId))];
        const users = await UserService.getByIds(userIds);

        totalLog.notShot = countOfVideo - countOfShotVideoDistinct;
        totalLog.workTimeEstimate = project.workTimeRatio * totalLog.videoDuration;
        totalLog.equalizeEstimate = project.equalizeRatio * totalLog.videoDuration;

        if (logDetailObj.length > 0) {
            let group = {};

            for (const log of logDetailObj) {
                if (!group[log.userId]) {
                    group[log.userId] = [];
                }
                group[log.userId].push(log);
            }

            for (const userId in group) {
                let index = groupArr.push({
                    ...this.shotLogService.createTotalLogObject(group[userId], videoFileAsObject),
                    user: {
                        userId,
                        fullName: (users.find(item => item.id == userId)).fullName
                    }
                });

                groupArr[index - 1].workTimeEstimate = project.workTimeRatio * groupArr[index - 1].videoDuration;
                groupArr[index - 1].equalizeEstimate = project.equalizeRatio * groupArr[index - 1].videoDuration;
            }
        }

        return { totalLog, groupArr, projectInfo: project }
    }

    async findOrCreateProjectWithTitle(title) {
        const project = await Project.findOrCreate({ where: { title } });
        return project;
    }

    async findByTitle(title) {
        return await Project.findOne({ where: { title } });
    }

    async createProject(body) {
        const checkTitle = await this.findByTitle(body.title); // await Project.findOne({ where: { title: body.title } });
        if (checkTitle) {
            throw ErrorResult.badRequest("title is unique")
        }

        const proj = await Project.create(body);
        return proj;
    }

    async updateProject(projectId, body = {}) {
        const checkTitle = await Project.findOne({ where: { title: body.title, id: { $not: projectId } } });
        if (checkTitle) {
            throw ErrorResult.badRequest("title is unique")
        }

        const project = await this.getById(projectId);
        Object.keys(body).forEach(item => {
            project[item] = body[item]
        });

        await project.save();

        return project.toJSON();
    }

    async deleteProject(projectId) {
        const project = await this.getById(projectId);

        const { videoFiles } = await videoFileService.getVideoFileList({ projectId })

        for (const file of videoFiles) {
            const filePath = path.join(file.path, file.name)
            if (fs.existsSync(filePath))
                fs.unlinkSync(filePath)
            await file.destroy()
        }

        await this.shotService.deleteByProjectId(projectId)

        await project.destroy()

        return true;
    }

    async checkAndUpdateWithUUID(projectes){
        let newProjects = [];
        for(let i = 0; i < projectes.length; i++){
            let project = await Project.findOne({ where: { UUID: projectes[i].UUID } });
            if(!project){
                project = await Project.create({ UUID: projectes[i].UUID, title: projectes[i].title });
            }

            newProjects.push({
                oldId: projectes[i].id,
                id: project.id,
                UUID: projectes[i].UUID
            })

            delete projectes[i].id;

            Object.keys(projectes[i]).forEach(key => project[key] = projectes[i][key]);
            await project.save();
        }

        return newProjects;
    }
}

module.exports = ProjectService;
