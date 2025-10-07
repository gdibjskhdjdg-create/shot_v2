const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require("child_process");
const { readdir, rename, lstat } = require('fs/promises');

const Service = require("../../_default/service");
const { logError } = require('../../../helper/log.tool');
const { generateRandomCode } = require('../../../helper/general.tool');

const { VideoFile, VideoFileLog, VideoDetail, Project, User, Shot, sequelize } = require("../../_default/model");

const { log, errorLog } = require('../../../helper/showLog');
const TypeTool = require('../../../helper/type.tool');
const { createPaginationQuery } = require('../../../helper/SqlHelper.tool');
const ErrorResult = require('../../../helper/error.tool');
const emitter = require('../../_default/eventEmitter');
const { VideoInfoShotStatus_Enum, VideoInfoStatus_Enum } = require('../../models/videoDetail/enum/VideoInfo.enum');
const { pipeline } = require('stream');
const util = require('util');
const pump = util.promisify(pipeline);

class VideoFileService extends Service {

    constructor(ShotService = () => { }, VideoInfoService = () => { }) {

        super(VideoFile);

        this.ShotService = ShotService;
        this.VideoInfoService = VideoInfoService
        this.pathToStoreFile = path.join(__dirname, '..', '..', '..', appConfigs.MainFile_FOLDER_FROM_APP_ROOT);

        this.updateVideoFileShotCount = this.updateVideoFileShotCount.bind(this);
        this.updateVideoFileShotCountOfProject = this.updateVideoFileShotCountOfProject.bind(this);
    }

    getVideoFileURL(videoFileId) {
        return `${appConfigs.APP_URL}/api/videoFile/show/${videoFileId}`;
    }

    async getByIds(ids = [], attributes = {}) {
        const sqlQuery = {
            where: { id: { [Op.in]: ids } },
            attributes,
        }

        const result = await VideoFile.findAll(sqlQuery);

        return result
    }

    async restartEncode() {
        await VideoFile.update({ status: 0 }, { where: { status: 2 } });
        console.log("Restart encoder");
    }


    async checkAndStartEncode() {
        // Check if there is currently an encoding process
        const encodeProcess = await VideoFile.findOne({ where: { status: 2 } });
        if (encodeProcess) {
            errorLog("Encode is busy!!")
            return
        }

        // Define conditions to search for the video
        const conditions = [
            { status: 0, format: { [Op.notIn]: ["mp4", "MP4"] }, isImportant: 1 }, // Important non-MP4 videos
            { status: 0, isImportant: 1 }, // Important videos
            { status: 0, format: { [Op.notIn]: ["mp4", "MP4"] } }, // Non-MP4 videos
            { status: 0 } // Any queued video
        ];

        let video;

        // Find the first video that matches any of the defined conditions
        for (const condition of conditions) {
            video = await VideoFile.findOne({ where: condition });
            if (video) break; // Exit loop once a video is found
        }

        // If a video is found, start the encoding process
        if (video) {
            await this.encodeVideo(video); // Proceed to encode
            // await this.checkAndStartEncode();
        } else {
            // errorLog("No videos found to encode."); // Optional logging if no video is found
        }
    }
    async getVideoMediaInfo(videoPath) {
        return new Promise((resolve, reject) => {
            exec(`mediainfo "${videoPath}" --Full --Output=JSON`, async (error, stdout, stderr) => {
                if (error) {
                    logError("mediainfo", new Error(error));
                    return resolve(null);
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return resolve(null);
                }

                let data = JSON.parse(stdout);
                return resolve(data);
            })
        })
    }

    getEncodedVideoFileName(video) {
        let mp4Name = video.name.split('.');
        mp4Name[mp4Name.length - 1] = 'mp4';
        mp4Name = "convert_" + mp4Name.join(".");

        return mp4Name;
    }

    async encodeVideo(video) {
        video.status = 2;
        await video.save();

        return new Promise(async (resolve, reject) => {
            let mp4Name = this.getEncodedVideoFileName(video);

            const pathToStoreFile = path.join(__dirname, '..', '..', '..', appConfigs.MainFile_FOLDER_FROM_APP_ROOT);
            const newPath = path.join(`${pathToStoreFile}`, "new_videos", `${video.projectId}`, `${video.originalPath}`);

            fs.mkdirSync(newPath, { recursive: true });

            let scale = 1080;
            let bitrate = null;
            if (!video.height) {
                scale = 480;
            }
            else if (video.height < scale) {
                scale = video.height;
            }

            try {
                bitrate = video.bitrate
                if (!bitrate) {
                    const mediaInfoData = JSON.parse(video.fullInfo);
                    bitrate = (mediaInfoData.track.find(item => item["@type"] === "Video"))?.BitRate ?? null;
                }
                if (bitrate && bitrate > 10000000) {
                    bitrate = "10M";
                }
            }
            catch (err) {
                console.log(33333333, err)
            }

            let command = `ffmpeg -y -hide_banner -threads 0 -i "${video.path}/${video.name}"`;
            command += " -preset slow";
            command += " -codec:a aac -b:a 128k";
            command += " -codec:v libx264 -pix_fmt yuv420p";
            if (bitrate) {
                command += ` -b:v ${bitrate} -minrate ${bitrate} -maxrate ${bitrate} -bufsize 15M`;
            }
            command += ` -vf scale=-2:${scale} "${newPath}/${mp4Name}"`;

            await VideoFileLog.create({
                videoFileId: video.id,
                status: "action",
                action: "startEncode",
                msg: JSON.stringify(command)
            })

            log("start convert!!");

            let ffmpegOptionCommand = {
                detached: false,
                shell: true,
            }

            console.log(111111, 'COmmand :' + command)

            this.child = spawn(command, ffmpegOptionCommand);
            this.pid = this.child.pid;

            // if (process.env.APP === 'production') {
            //     /* Store video convert log in file */
            //     var logStream = fs.createWriteStream(`${this.video.fileLocation}/convert_log_${this.type}.log`, { flags: 'a' });
            //     this.child.stdout.pipe(logStream);
            //     this.child.stderr.pipe(logStream);
            // }

            this.child.stdout.on('data', (data) => {
                console.log(222222222222, data.toString())
            });

            this.child.stderr.on('data', (data) => {
                console.log(11111111111, data.toString())
            });

            this.child.on('error', async (err) => {
                video.status = 4;
                await video.save();

                await VideoFileLog.create({
                    videoFileId: video.id,
                    status: "error",
                    action: "endEncode",
                    msg: JSON.stringify(err.stack)
                });

                return resolve(video);
            });

            this.child.on('exit', async (e) => {
                video = await this.completeEncodeVideo(video, newPath, mp4Name, e)
                return resolve(video);
            });
        })
    }

    async completeEncodeVideo(video, filePath, fileName, log = null) {
        // fs.unlink(`${video.path}/${video.name}`, (err) => { })
        video.path = filePath;
        video.name = fileName;

        if (video.userId) {
            video.status = 5;
            video.referralAt = new Date();
        }
        else {
            video.status = 3;
        }

        await video.save();

        await VideoFileLog.create({
            videoFileId: video.id,
            status: "action",
            action: "endEncode",
        });

        return video;
    }

    async getVideoFileList(filters = {}) {
        const {
            id = null,
            page = null,
            take = null,
            userId = null,
            projectId = null,
            hasShot = null,
            originalName = null,
            status = null,
            completeEncode = false,
            acceptRequired = false,
            sortKey = "",
            sortACS = "",
        } = filters;

        let sqlIncludeQuery = [
            {
                model: User,
                as: "user",
                attributes: ['id', 'fullName']
            },
            {
                model: Project,
                as: "project",
                attributes: ['id', 'title', 'workTimeRatio', 'equalizeRatio']
            },
            {
                model: VideoDetail,
                as: "videoDetail",
                attributes: ['status']
            }
        ];
        let sqlWhereQuery = {}

        if (!TypeTool.isNullUndefined(id)) {
            sqlWhereQuery.id = id;
        }

        if (TypeTool.boolean(userId)) {
            sqlWhereQuery.userId = userId;
        }
        if (TypeTool.boolean(projectId)) {
            sqlWhereQuery.projectId = projectId;
        }
        if (!TypeTool.isNullUndefined(hasShot)) {
            if (hasShot) {
                sqlWhereQuery.shotCount = { [Op.gt]: 0 };
            }
            else {
                sqlWhereQuery.shotCount = 0;
            }
        }
        if (TypeTool.boolean(originalName)) {
            sqlWhereQuery.originalName = { [Op.like]: `%${TypeTool.string(originalName).trim()}%` }
        }

        if (TypeTool.isNotEmptyString(status)) {
            sqlWhereQuery.status = status;
        }

        if (TypeTool.boolean(completeEncode)) {
            sqlWhereQuery.status = { [Op.gt]: 4 };
        }

        let sqlQuery = {
            where: sqlWhereQuery,
            include: sqlIncludeQuery,
            attributes: { exclude: ["fullInfo"] }
        };

        sqlQuery = createPaginationQuery(sqlQuery, page, take);
        sqlQuery.order = [['id', 'DESC'],
        [
            TypeTool.boolean(sortKey) ? sortKey : "createdAt",
            TypeTool.boolean(sortACS) ? sortACS : "DESC"
        ],
        ];

        const [count, rows] = await Promise.all([
            VideoFile.count({ where: sqlWhereQuery }),
            VideoFile.findAll({ ...sqlQuery })
        ]);

        return {
            videoFiles: rows,
            count: count
        };
    }

    async getCountOfVideoFile({ projectId }) {
        return await VideoFile.count({ where: { projectId } });
    }

    async getInitVideoInfoList(filters = {}) {
        let shotStatus = 'init-check';
        if (['init-check', 'editor'].includes(filters.shotStatus)) {
            shotStatus = filters.shotStatus;
        }

        return await this.getAcceptedVideoInfoList({
            ...filters,
            shotStatus,
        });
    }

    async getEditorVideoInfoList(filters = {}) {
        let shotStatus = 'editor';
        if (['editor', 'equalizing'].includes(filters.shotStatus)) {
            shotStatus = filters.shotStatus;
        }

        return await this.getAcceptedVideoInfoList({
            ...filters,
            shotStatus,
        });
    }

    async getEqualizingVideoInfoList(filters = {}) {
        let shotStatus = 'equalizing';
        if (['equalizing', 'equalized'].includes(filters.shotStatus)) {
            shotStatus = filters.shotStatus;
        }

        return await this.getAcceptedVideoInfoList({
            ...filters,
            shotStatus,
        });
    }

    async getEqualizedVideoInfoList(filters = {}) {
        let shotStatus = 'equalized';
        return await this.getAcceptedVideoInfoList({
            ...filters,
            shotStatus,
        });
    }

    async getAcceptedVideoInfoList(filters = {}) {
        return await this.getVideoInfoList({
            ...filters,
            status: "accept"
        });
    }

    async getVideoInfoList(filters = {}) {
        const {
            id = null,
            page = null,
            take = null,
            userId = null,
            projectId = null,
            status = null,
            shotStatus = null,
            title = null
        } = filters;

        const videoDetailFilters = { page, take }
        if (TypeTool.boolean(id)) videoDetailFilters.videoFileId = id;
        if (TypeTool.boolean(userId)) videoDetailFilters.userId = userId;
        if (TypeTool.boolean(projectId)) videoDetailFilters.projectId = projectId;
        if (TypeTool.boolean(shotStatus)) videoDetailFilters.shotStatus = shotStatus;
        if (TypeTool.boolean(status)) videoDetailFilters.status = status;
        if (TypeTool.boolean(title)) videoDetailFilters.search = title;

        const { videoDetails, count } = await this.VideoInfoService.list(videoDetailFilters)

        const videoFiles = videoDetails.map(item => item.toJSON())

        return { videoFiles, count };
    }

    async getInitCheckDetailFolder(filters = {}) {
        return await this.getDetailOfFolder({ ...filters, shotStatus: VideoInfoShotStatus_Enum.initCheck.value })
    }

    async getEditorDetailFolder(filters = {}) {
        return await this.getDetailOfFolder({ ...filters, shotStatus: VideoInfoShotStatus_Enum.editor.value })
    }

    async getEqualizingDetailFolder(filters = {}) {
        return await this.getDetailOfFolder({ ...filters, shotStatus: VideoInfoShotStatus_Enum.equalizing.value })
    }

    async getEqualizedDetailFolder(filters = {}) {
        return await this.getDetailOfFolder({ ...filters, shotStatus: VideoInfoShotStatus_Enum.equalized.value })
    }

    async getInitVideoInfoFolder(filters = {}) {

        return await this.getDetailOfFolder({ ...filters, videoStatus: VideoInfoStatus_Enum.init.value })
    }

    async getCleaningVideoInfoFolder(filters = {}) {
        return await this.getDetailOfFolder({ ...filters, videoStatus: VideoInfoStatus_Enum.cleaning.value })
    }

    async getCleanedVideoInfoFolder(filters = {}) {
        return await this.getDetailOfFolder({
            ...filters, videoStatus: [
                VideoInfoStatus_Enum.cleaning.value, VideoInfoStatus_Enum.accept.value, VideoInfoStatus_Enum.reject.value
            ]
        })
    }


    async getDetailOfFolder(filters = {}) {
        const {
            projectId,
            reqPath = "",
            userId = null,
            shotDetail = false,
            shotStatus = null,
            videoStatus = null,
        } = filters;

        const { videoFileNames, files } = await this.getPathDetail(projectId, reqPath);

        let fileInDB = [];
        if (videoFileNames.length > 0) {
            let sqlQuery = {
                where: {
                    projectId,
                    name: videoFileNames,
                    // path: pathToFiles
                },
                include: [{
                    model: User,
                    as: "user",
                    attributes: ['id', 'fullName']
                }],

                attributes: { exclude: ["fullInfo"] }
            };

            if (shotDetail) {
                sqlQuery.include.push({
                    model: Shot,
                    as: "shots",
                    attributes: ["id", "title", "lastEqualizeLogId"]
                })
            }

            if (userId) {
                sqlQuery.where.userId = userId;
            }

            if (shotStatus || videoStatus) {
                sqlQuery.include.push({
                    model: VideoDetail,
                    as: "videoDetail",
                    attributes: [],
                    where: { ...(shotStatus ? { shotStatus } : {}), ...(videoStatus ? { status: videoStatus } : {}) }
                })
            }

            fileInDB = await VideoFile.findAll(sqlQuery);
        }

        let userSeenFiles = [];
        files.forEach(file => {
            if (!file.isFile) {
                userSeenFiles.push(file);
            }
            else {
                let fileDetail = fileInDB.find(item => item.name === file.name);
                if (fileDetail) {
                    userSeenFiles.push({
                        ...file,
                        name: fileDetail.originalName,
                        detail: fileDetail
                    })
                }
            }
        })

        return userSeenFiles;
    }

    async getPathDetail(projectId, reqPath, exception = true) {
        const pathToFiles = path.join(`${this.pathToStoreFile}`, "new_videos", `${projectId}`, `${reqPath}`);
        const pathToNotTranscode = path.join(`${this.pathToStoreFile}`, "not_transcode_files", `${projectId}`, `${reqPath}`);
        if (exception && (!fs.existsSync(pathToFiles) && !fs.existsSync(pathToNotTranscode))) {
            throw ErrorResult.badRequest("Invalid path");
        }

        let files = [];
        let videoFileNames = [];
        if (fs.existsSync(pathToFiles)) {
            files = await readdir(pathToFiles);
            for (let i = 0; i < files.length; i++) {
                const stats = await lstat(path.join(pathToFiles, files[i]));
                const isFile = stats.isFile();
                if (isFile) {
                    videoFileNames.push(files[i])
                }

                files[i] = {
                    isFile,
                    name: files[i]
                }
            }
        }

        if (fs.existsSync(pathToNotTranscode)) {
            let filesNotTranscode = await readdir(pathToNotTranscode);
            for (let i = 0; i < filesNotTranscode.length; i++) {
                const stats = await lstat(path.join(pathToNotTranscode, filesNotTranscode[i]));
                const isFile = stats.isFile();
                if (isFile) {
                    videoFileNames.push(filesNotTranscode[i])
                }

                const checkExistFolder = files.find(it => it.name === filesNotTranscode[i]);
                if (!checkExistFolder) {
                    files.push({
                        isFile,
                        name: filesNotTranscode[i]
                    })
                }
            }
        }

        return { videoFileNames, files, pathToFiles };
    }

    async getVideoFileDetail(videoFileId, filters = {}) {
        let videoFile = await VideoFile.findOne({
            where: { id: videoFileId },
            include: [
                {
                    model: Project,
                    as: "project",
                    attributes: ['id', 'title']
                },
                {
                    model: VideoDetail,
                    as: 'videoDetail',
                    ...(filters.shotStatus ? { where: { 'shotStatus': filters.shotStatus } } : {})
                }
            ],
        });


        if (!videoFile) {
            throw ErrorResult.notFound("video File is not found");
        }
        videoFile = videoFile.toJSON();
        videoFile.videoFileUrl = this.getVideoFileURL(videoFileId);
        return videoFile;
    }

    async getVideoFileLog(videoFileId) {
        const videoFileLog = await VideoFileLog.findAll({ where: { videoFileId } });

        return videoFileLog;
    }

    async setImportantEncodeVideo(videoFileId, isImportant) {

        const videoFile = await this.getById(videoFileId)
        if (videoFile.status != 0) {
            throw ErrorResult.badRequest("فایل شما در صف تبدیل قرار ندارد")
        }

        if (isImportant != 0 && isImportant != 1) {
            throw ErrorResult.badRequest("مقادیر وارد شده معتبر نیست")
        }


        videoFile.isImportant = isImportant
        await videoFile.save()

    }

    async setImportantOfVideosOfProject(projectId, isImportant) {

        if (isImportant != 0 && isImportant != 1) {
            throw ErrorResult.badRequest("مقادیر وارد شده معتبر نیست")
        }


        await VideoFile.update({ isImportant }, { where: { projectId } });

    }

    // assign to user ************************
    async assignVideosPath2User(userId, projectId, path) {
        const findBVideosByPath = await VideoFile.findAll(
            {
                where: {
                    projectId,
                    originalPath: {
                        [Op.like]: `${path}%` // Match originalPaths starting with path
                    }
                }
            })
        if (!findBVideosByPath?.length) {
            throw ErrorResult.notFound("not Found any Videos In Path")
        }


        const videoFileIds = findBVideosByPath.map(x => x.id);
        const [affectedRows, updatedRows] = await VideoFile.update({ userId }, { where: { id: videoFileIds } });
        await VideoDetail.update({ userId }, { where: { videoFileId: videoFileIds } });

        return affectedRows
    }

    async assignToUserByVideoFileIdProjectId(projectId, videoFileId, userId) {
        const [affectedRows, updatedRows] = await VideoFile.update({ userId }, { where: { projectId, id: videoFileId } });
        await VideoDetail.update({ userId }, { where: { videoFileId, projectId } });

        return affectedRows
    }

    async assignVideosOfProject2User(projectId, userId) {
        const [affectedRows, updatedRows] = await VideoFile.update({ userId }, { where: { projectId } });
        await VideoDetail.update({ userId }, { where: { projectId } });

        return affectedRows
    }

    async assignVideoFile2User(videoFileId, userId) {
        const videoFile = await this.getById(videoFileId);
        videoFile.userId = userId;
        await videoFile.save();

        await VideoDetail.update({ userId }, { where: { videoFileId } });
    }

    async assignVideoFileByQuery(videoFileId, { userId, originalPath, projectId = null }) {
        const videoFile = await this.getById(videoFileId);
        if (videoFile.status !== 3) {
            throw ErrorResult.conflict("video Status Cant Change");
        }
        if (!userId) {
            throw ErrorResult.badRequest("invalid userId")
        }

        videoFile.referralAt = new Date();
        videoFile.userId = userId;
        videoFile.originalPath = originalPath;
        videoFile.projectId = projectId;
        videoFile.status = 5;
        await videoFile.save();

        try {
            const newVideoDir = this.createPathInProjectFolder(projectId, originalPath);
            const pathToNewFile = path.join(newVideoDir, videoFile.name);
            await rename(
                path.join(videoFile.path, videoFile.name),
                pathToNewFile
            );

            videoFile.path = newVideoDir;
            await videoFile.save();

            emitter.emit('assignVideo2Shot', videoFile.toJSON())
        }
        catch (err) { }
    }
    // ******************************************

    async getVideoFileToShow(videoFileId) {
        const video = await this.getById(videoFileId);
        const videoPath = path.join(video.path, video.name);
        // const videoPath = "D:\\videos\\output.mp4";
        let videoSize = 0
        try {
            videoSize = fs.statSync(videoPath).size;
        } catch (error) {
            videoSize = 0
        }

        return { videoPath, videoSize };
    }

    async uploadVideoFile(req, otherInfo = {}) {
        const service = this

        return new Promise(async (resolve, reject) => {

            try {
                const { file, ...fields } = req.body

                const videoFile = file?.toBuffer()
                const fileName = file?.filename
                if (!videoFile) {
                    // throw ErrorResult.badRequest("file is required");
                    return reject(ErrorResult.badRequest('file is required'))
                }

                const pathToDestination = this.pathToStoreFile
                if (!fs.existsSync(pathToDestination)) {
                    fs.mkdirSync(pathToDestination, { recursive: true });
                }
                const convertRequired = TypeTool.isNullUndefined(fields.convertRequired?.value) ? true : TypeTool.boolean(fields.convertRequired.value)

                const newPath = path.join(pathToDestination, fileName);


                await pump(videoFile, fs.createWriteStream(newPath));
                await service.moveAndStoreFile(newPath, fileName, { ...otherInfo, convertRequired });
                return resolve();
            } catch (error) {
                console.log(error)
                return reject(err);
            }

        })

        // return new Promise((resolve, reject) => {
        //     const pathToDestination = this.pathToStoreFile
        //     formData.parse(req, async function (err, fields, files) {

        //         try {
        //             if (err) {
        //                 throw ErrorResult.badRequest(err.message);
        //             }
        //             const file = files.file[0];
        //             const convertRequired = TypeTool.isNullUndefined(fields.convertRequired?.[0]) ? true : TypeTool.boolean(fields.convertRequired[0])

        //             fs.mkdirSync(pathToDestination, { recursive: true });
        //             const newPath = path.join(pathToDestination, file.originalFilename);

        //             fs.copyFile(file.filepath, newPath, async function (err) {
        //                 if (err) {
        //                     return reject(ErrorResult.internal("Upload error!"))
        //                 }
        //                 // const service = new VideoFileService();
        //                 await service.moveAndStoreFile(newPath, file.originalFilename, { ...otherInfo, convertRequired });
        //                 return resolve();
        //             });
        //         }
        //         catch (err) {
        //             console.log(err)
        //             return reject(err);
        //         }
        //     });
        // })
    }

    async updateVideoFileShotCount(videoFileId) {
        const { count } = await this.ShotService.shotList({ videoFileId });
        const videoFile = await VideoFile.findByPk(videoFileId);
        if (videoFile) {
            videoFile.shotCount = count;
            await videoFile.save();
        }

        emitter.emit('updateVideoFileShotCount', videoFile.toJSON())
        return;
    }

    async updateVideoFileShotCountOfProject(projectId) {
        const videoFiles = await VideoFile.findAll({ where: { projectId } });
        for (let i = 0; i < videoFiles.length; i++) {
            const { count } = await this.ShotService.shotList({ videoFileId: videoFiles[i].id });
            if (count === 0 && videoFiles[i].name === "nothing" && videoFiles[i].path === "nothing") {
                await videoFiles[i].destroy();
            }
            else {
                videoFiles[i].shotCount = count;
                await videoFiles[i].save();
            }
        }

        emitter.emit('updateVideoFileShotCountProject', projectId);

        return;
    }

    async moveAndStoreFile(fileDir, originalName, otherData = {}) {
        const {
            projectId = null,
            originalPath = null,
            userId = null,
            videoId = null,
            convertRequired = true,
            needTranscode = true,
            isAI = false
        } = otherData;

        let newVideoDir = this.createPathInProjectFolderNotTranscoded(projectId, originalPath);
        if (!needTranscode) {
            newVideoDir = this.createPathInProjectFolder(projectId, originalPath)
        }

        console.log("create videoDir:", { newVideoDir });

        const fileExtension = (originalName.split('.').reverse())[0]
        const newName = Date.now() + generateRandomCode(5) + '.' + fileExtension;

        let pathToNewFile = "";

        console.log("rename:", { newVideoDir, newName })
        try {
            pathToNewFile = path.join(newVideoDir, newName);
            await rename(fileDir, pathToNewFile);
        }
        catch (err) {
            logError("Move file", err, 'move_files');
            return;
        }

        let video = null
        if (videoId) {
            console.log("exist video:", { videoId });

            video = await this.getById(videoId)
            const videoPath = path.join(video.path, video.name)

            if (fs.existsSync(videoPath)) {
                fs.unlinkSync(videoPath)
            }

            video.path = newVideoDir
            video.name = newName;

            await video.save();
            console.log("update video:", { videoId });
        }
        else {
            video = await VideoFile.findOne({
                where: { originalName, originalPath }
            });

            if (!video) {
                video = await VideoFile.create({
                    originalName,
                    projectId,
                    originalPath,
                    userId,
                    name: newName,
                    path: newVideoDir,
                    format: fileExtension,
                });
                console.log("create video:", { originalName });

                await this.VideoInfoService.newVideoFile({ ...video.toJSON(), isAI })
            }
            else {
                video.name = newName;
                video.path = newVideoDir;
                video.format = fileExtension;

                await video.save();

                console.log("222 update video:", { newName, newVideoDir, fileExtension });
            }
        }

        const detail = await this.VideoInfoService.findOrCreate({ ...video.toJSON(), isAI });
        console.log("create detail:", { detail });

        if (convertRequired === true) {
            try {
                const mediaInfoData = await this.getVideoMediaInfo(pathToNewFile);
                console.log("get Info:", { mediaInfoData });

                const videoDetail = mediaInfoData.media.track.find(item => item["@type"] === "Video");
                const generalDetail = mediaInfoData.media.track.find(item => item["@type"] === "General");

                video.height = videoDetail?.Height ?? "";
                video.width = videoDetail?.Width ?? "";
                video.size = (generalDetail?.FileSize ?? null);
                video.duration = videoDetail?.Duration ?? "";
                video.frameRate = videoDetail?.FrameRate ?? "";
                video.aspectRatio = videoDetail?.DisplayAspectRatio_String ?? "";

                video.fullInfo = JSON.stringify(mediaInfoData.media);
                video.status = needTranscode ? 0 : 3;

                await video.save();
                console.log("update Info:");

                detail.duration = videoDetail?.Duration ?? "";
                await detail.save()

                emitter.emit('moveAndStoreFile', video.toJSON());

                if (!needTranscode) {
                    fs.renameSync(path.join(newVideoDir, video.name), path.join(newVideoDir, this.getEncodedVideoFileName(video)))
                    await this.completeEncodeVideo(video, newVideoDir, this.getEncodedVideoFileName(video));
                }
            } catch (err) {
                consolve.log(err)
            }
        }

        return video;
    }

    createPathInProjectFolder(projectId, originalPath = null) {
        const pathToVideos = path.join(this.pathToStoreFile, 'new_videos');
        fs.mkdirSync(pathToVideos, { recursive: true });

        let newVideoDir = "";
        if (originalPath && projectId) {
            newVideoDir = path.join(pathToVideos, projectId.toString(), originalPath);
        }
        else {
            newVideoDir = path.join(pathToVideos, "n");
        }
        fs.mkdirSync(newVideoDir, { recursive: true });

        return newVideoDir;
    }

    createPathInProjectFolderNotTranscoded(projectId, originalPath = null) {
        const pathToVideos = path.join(this.pathToStoreFile, 'not_transcode_files');
        fs.mkdirSync(pathToVideos, { recursive: true });

        let newVideoDir = "";
        if (originalPath && projectId) {
            newVideoDir = path.join(pathToVideos, projectId.toString(), originalPath);
        }
        else {
            newVideoDir = path.join(pathToVideos, "n");
        }
        fs.mkdirSync(newVideoDir, { recursive: true });

        return newVideoDir;
    }

    async deleteVideoFile(sourceId) {
        const videoFile = await this.getById(sourceId);
        if (videoFile.shotCount !== 0) {
            throw ErrorResult.badRequest("has Shot");
        }

        await videoFile.destroy();

        return;
    }

    async deleteMainFileOfProject(projectId) {
        let fileCount = 0;
        // const pathToStoreFile = path.join(__dirname, '..', '..', '..', appConfigs.MainFile_FOLDER_FROM_APP_ROOT);
        try {
            const videos = await VideoFile.findAll({ where: { projectId } });

            for (let i = 0; i < videos.length; i++) {
                const item = videos[i];

                let pathVideoDir = await this.getPathDetail(projectId, item.originalPath, false)
                pathVideoDir = pathVideoDir.pathToFiles

                let code = item.name.split(".")[0].split("_")[1];
                const fileName = `${code}.${item.format}`
                const pathToFile = path.join(pathVideoDir, fileName);

                console.log(fs.existsSync(pathToFile), fileName !== item.name, projectId)
                if (fs.existsSync(pathToFile) && fileName !== item.name) {
                    console.log(pathToFile)
                    const state = fs.statSync(pathToFile);
                    fs.unlinkSync(pathToFile);
                    fileCount++;
                }
            }
        }
        catch (err) {
            console.log(err)
        }
    }

    async updateFileInfo_Service(videoFileId, data) {
        let videoFile = await VideoFile.findOne({ where: { id: videoFileId } });
        if (!videoFile) {
            throw ErrorResult.notFound();
        }

        const keys = ['originalName', 'format', 'width', 'height', 'duration', 'size', 'frameRate', 'aspectRatio', 'bitrate']
        keys.forEach(key => {
            if (data[key]) {
                videoFile[key] = data[key];
            }
        });

        await videoFile.save()
    }
}

module.exports = VideoFileService;
