const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const { readdir, rename, lstat } = require('fs/promises');
const util = require('util');
const { pipeline } = require('stream');

const { VideoFile, VideoFileLog, VideoDetail, Project, User, Shot } = require("../../_default/model");
const emitter = require('../../_default/eventEmitter');
const { logError } = require('../../../helper/log.tool');
const { generateRandomCode, createPaginationQuery } = require('../../../helper/SqlHelper.tool');
const TypeTool = require('../../../helper/type.tool');
const ErrorResult = require('../../../helper/error.tool');
const { VideoDetailShotStatus_Enum, VideoDetailStatus_Enum } = require('../../models/videoDetail/enum/VideoDetail.enum');

const pump = util.promisify(pipeline);
const pathToStoreFile = path.join(__dirname, '..', '..', '..', appConfigs.MainFile_FOLDER_FROM_APP_ROOT);

// --- Helper Functions ---

const getVideoFileUrl = (videoFileId) => `${appConfigs.APP_URL}/api/videoFile/show/${videoFileId}`;

const getById = (id) => VideoFile.findByPk(id);

const getByIds = (ids = []) => VideoFile.findAll({ where: { id: { [Op.in]: ids } } });

const generateEncodedVideoFileName = (video) => {
    const nameParts = video.name.split('.');
    nameParts[nameParts.length - 1] = 'mp4';
    return `convert_${nameParts.join(".")}`;
};

const createPathInProjectFolder = (projectId, originalPath = null, baseFolder = 'new_videos') => {
    const pathToVideos = path.join(pathToStoreFile, baseFolder);
    fs.mkdirSync(pathToVideos, { recursive: true });
    let newVideoDir = path.join(pathToVideos, "n"); // Default path
    if (originalPath && projectId) {
        newVideoDir = path.join(pathToVideos, projectId.toString(), originalPath);
    }
    fs.mkdirSync(newVideoDir, { recursive: true });
    return newVideoDir;
};

// --- Encoding Functions ---

const restartStalledEncodes = async () => {
    await VideoFile.update({ status: 0 }, { where: { status: 2 } });
    console.log("Restarted stalled encodes.");
};

const finalizeEncodeProcess = async (video, filePath, fileName) => {
    video.path = filePath;
    video.name = fileName;
    video.status = video.userId ? 5 : 3; // 5: Referred, 3: Encoded
    if (video.userId) video.referralAt = new Date();
    
    await video.save();
    await VideoFileLog.create({ videoFileId: video.id, status: "action", action: "endEncode" });
    return video;
};

const encodeVideoFile = (video) => {
    return new Promise(async (resolve) => {
        await video.update({ status: 2 });
        const mp4Name = generateEncodedVideoFileName(video);
        const newPath = createPathInProjectFolder(video.projectId, video.originalPath);

        let scale = (video.height && video.height >= 1080) ? 1080 : 480;
        if (video.height && video.height < 1080) scale = video.height;

        let bitrate = null;
        try {
            if (video.bitrate) {
                bitrate = video.bitrate;
            } else if (video.fullInfo) {
                const mediaInfo = JSON.parse(video.fullInfo);
                bitrate = mediaInfo.track.find(t => t["@type"] === "Video")?.BitRate ?? null;
            }
            if (bitrate && bitrate > 10000000) bitrate = "10M";
        } catch (e) { console.error("Bitrate calculation error:", e); }

        const command = `ffmpeg -y -hide_banner -threads 0 -i "${path.join(video.path, video.name)}" -preset slow -codec:a aac -b:a 128k -codec:v libx264 -pix_fmt yuv420p ${bitrate ? `-b:v ${bitrate} -minrate ${bitrate} -maxrate ${bitrate} -bufsize 15M` : ''} -vf scale=-2:${scale} "${path.join(newPath, mp4Name)}"`;
        await VideoFileLog.create({ videoFileId: video.id, status: "action", action: "startEncode", msg: command });

        const child = spawn(command, { detached: false, shell: true });
        child.on('error', async (err) => {
            await video.update({ status: 4 });
            await VideoFileLog.create({ videoFileId: video.id, status: "error", action: "endEncode", msg: err.stack });
            resolve(video);
        });
        child.on('exit', async () => {
            const updatedVideo = await finalizeEncodeProcess(video, newPath, mp4Name);
            resolve(updatedVideo);
        });
    });
};

const triggerEncodeProcess = async () => {
    if (await VideoFile.findOne({ where: { status: 2 } })) return;
    const conditions = [
        { status: 0, isImportant: 1, format: { [Op.notIn]: ["mp4", "MP4"] } },
        { status: 0, isImportant: 1 },
        { status: 0, format: { [Op.notIn]: ["mp4", "MP4"] } },
        { status: 0 }
    ];
    for (const condition of conditions) {
        const video = await VideoFile.findOne({ where: condition });
        if (video) {
            await encodeVideoFile(video);
            break;
        }
    }
};

// --- CRUD and Business Logic ---

const list = async (filters = {}) => {
    const { page, take, sortKey, sortACS, hasShot, completeEncode, ...whereFilters } = filters;
    const whereClause = { ...whereFilters };
    if (whereFilters.originalName) whereClause.originalName = { [Op.like]: `%${whereFilters.originalName.trim()}%` };
    if (hasShot !== undefined) whereClause.shotCount = hasShot ? { [Op.gt]: 0 } : 0;
    if (completeEncode) whereClause.status = { [Op.gt]: 4 };

    const query = {
        where: whereClause,
        include: [
            { model: User, as: "user", attributes: ['id', 'fullName'] },
            { model: Project, as: "project" },
            { model: VideoDetail, as: "videoDetail", attributes: ['status'] }
        ],
        attributes: { exclude: ["fullInfo"] },
        order: [[sortKey || 'createdAt', sortACS || 'DESC']],
    };
    const [count, videoFiles] = await Promise.all([
        VideoFile.count({ where: whereClause }),
        VideoFile.findAll(createPaginationQuery(query, page, take))
    ]);
    return { videoFiles, count };
};

const getOne = async (id, filters = {}) => {
    const videoFile = await VideoFile.findOne({
        where: { id },
        include: [
            { model: Project, as: "project" },
            { model: VideoDetail, as: 'videoDetail', ...(filters.shotStatus ? { where: { 'shotStatus': filters.shotStatus } } : {})}
        ],
    });
    if (!videoFile) throw ErrorResult.notFound("Video File not found");
    const json = videoFile.toJSON();
    json.videoFileUrl = getVideoFileUrl(id);
    return json;
};

const deleteOne = async (id) => {
    const videoFile = await getById(id);
    if (!videoFile) throw ErrorResult.notFound("Video file not found");
    if (videoFile.shotCount > 0) throw ErrorResult.badRequest("Cannot delete: video has associated shots.");
    await videoFile.destroy();
};

const updateFileInfo = async (id, data) => {
    const videoFile = await getById(id);
    if (!videoFile) throw ErrorResult.notFound();
    const validKeys = ['originalName', 'format', 'width', 'height', 'duration', 'size', 'frameRate', 'aspectRatio', 'bitrate'];
    validKeys.forEach(key => { if (data[key] !== undefined) videoFile[key] = data[key]; });
    await videoFile.save();
    return videoFile;
};

const updateVideoFileShotCount = async (videoFileId) => {
    const shotService = require('../shotList/Shot.service');
    const { count } = await shotService.listShots({ videoFileId });
    const videoFile = await getById(videoFileId);
    if (videoFile) {
        videoFile.shotCount = count;
        await videoFile.save();
        emitter.emit('updateVideoFileShotCount', videoFile.toJSON());
    }
};

const updateVideoFileShotCountOfProject = async (projectId) => {
    const shotService = require('../shotList/Shot.service');
    const videoFiles = await VideoFile.findAll({ where: { projectId } });
    for (const videoFile of videoFiles) {
        const { count } = await shotService.listShots({ videoFileId: videoFile.id });
        if (count === 0 && videoFile.name === "nothing" && videoFile.path === "nothing") {
            await videoFile.destroy();
        } else {
            videoFile.shotCount = count;
            await videoFile.save();
        }
    }
    emitter.emit('updateVideoFileShotCountProject', projectId);
};

const moveAndStoreFile = async (fileDir, originalName, otherData = {}) => {
    const videoDetailService = require('../videoDetail/VideoDetail.service');
    const { projectId, originalPath, userId, videoId, convertRequired = true, needTranscode = true, isAI = false } = otherData;

    const baseFolder = needTranscode ? 'not_transcode_files' : 'new_videos';
    const newVideoDir = createPathInProjectFolder(projectId, originalPath, baseFolder);
    const fileExtension = path.extname(originalName);
    const newName = `${Date.now()}${generateRandomCode(5)}${fileExtension}`;
    const pathToNewFile = path.join(newVideoDir, newName);

    await rename(fileDir, pathToNewFile);

    let video = videoId ? await getById(videoId) : await VideoFile.findOne({ where: { originalName, originalPath } });

    if (video) {
        if (videoId) {
            const oldVideoPath = path.join(video.path, video.name);
            if (fs.existsSync(oldVideoPath)) fs.unlinkSync(oldVideoPath);
        }
        video.set({ path: newVideoDir, name: newName, format: fileExtension.slice(1) });
    } else {
        video = await VideoFile.create({
            originalName, projectId, originalPath, userId, name: newName, path: newVideoDir, format: fileExtension.slice(1)
        });
        await videoDetailService.newVideoDetailForVideoFile({ ...video.toJSON(), isAI });
    }
    await video.save();
    
    const detail = await videoDetailService.findOrCreateVideoDetail({ ...video.toJSON(), isAI });

    if (convertRequired) {
        const mediaInfo = await fetchVideoMediaInfo(pathToNewFile);
        if (mediaInfo) {
            const videoTrack = mediaInfo.media.track.find(t => t["@type"] === "Video");
            const generalTrack = mediaInfo.media.track.find(t => t["@type"] === "General");
            video.set({
                height: videoTrack?.Height, width: videoTrack?.Width,
                size: generalTrack?.FileSize, duration: videoTrack?.Duration,
                frameRate: videoTrack?.FrameRate, aspectRatio: videoTrack?.DisplayAspectRatio_String,
                fullInfo: JSON.stringify(mediaInfo.media),
                status: needTranscode ? 0 : 3,
            });
            await video.save();
            if (detail) {
                detail.duration = videoTrack?.Duration ?? "";
                await detail.save();
            }
            emitter.emit('moveAndStoreFile', video.toJSON());
            if (!needTranscode) {
                const finalEncodedName = generateEncodedVideoFileName(video);
                fs.renameSync(pathToNewFile, path.join(newVideoDir, finalEncodedName));
                await finalizeEncodeProcess(video, newVideoDir, finalEncodedName);
            }
        }
    }
    return video;
};


module.exports = {
    getById, getByIds, getOne, list, deleteOne, updateFileInfo,
    getVideoFileUrl, generateEncodedVideoFileName,
    restartStalledEncodes, triggerEncodeProcess, encodeVideoFile, fetchVideoMediaInfo, moveAndStoreFile,
    updateVideoFileShotCount, updateVideoFileShotCountOfProject
};