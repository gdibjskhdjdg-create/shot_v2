const fs = require('fs');

const ResponseDTO = require("../../_default/Response.dto");
const { videoFileService } = require("../../services/videoFile/index");
const VideoFileResponse = require('../../dto/videoFile/VideoFile.response');
const VideoFileListQuery = require('../../dto/videoFile/VideoFileList.query');
const ErrorResult = require('../../../helper/error.tool');
const VideoDetailResponse = require('../../dto/videoDetail/VideoDetail.response');

const getVideoFileList = async (req, res) => {
    const filters = VideoFileListQuery.create({
        page: 1,
        take: 10,
        sortKey: "createdAt",
        sortACS: "DESC",
        ...req.query
    });

    const user = req.user;
    if (user.permission !== 'admin' &&
        !user.access.includes("videos-full-access") &&
        !user.access.includes("source-full-access")
    ) {
        filters.userId = user.id;
    }

    const { videoFiles, count } = await videoFileService.getVideoFileList(filters);

    return ResponseDTO.success(res, { videoFiles: VideoFileResponse.create(videoFiles), count });
}

const getVideoFileListCanBeShot = async (req, res) => {
    const filters = VideoFileListQuery.create({
        page: 1,
        take: 10,
        sortKey: "createdAt",
        sortACS: "DESC",
        status: "accept",
        ...req.query
    });

    const user = req.user;
    const isSetUserId = user.permission !== 'admin' &&
        !user.access.includes("videos-full-access") &&
        !user.access.includes("source-full-access")

    if (isSetUserId) {
        filters.userId = user.id;
    }

    const { videoFiles, count } = await videoFileService.getVideoDetailList(filters);

    return ResponseDTO.success(res, { videoFiles: VideoDetailResponse.create(videoFiles), count });
}

const getInitCheckVideoFileListCanBeShot = async (req, res) => {
    const filters = VideoFileListQuery.create({
        page: 1,
        take: 10,
        shotStatus: "init-check",
        sortKey: "createdAt",
        sortACS: "DESC",
        ...req.query
    });

    const user = req.user;
    const hasNotFullAccess = user.permission !== 'admin' &&
        !user.access.includes("shot-full-access");

    if (hasNotFullAccess) {
        filters.userId = user.id;
    }
    const { videoFiles, count } = await videoFileService.getInitVideoDetailList(filters);

    return ResponseDTO.success(res, { videoFiles: VideoDetailResponse.create(videoFiles), count });
}

const getEditorCheckVideoFileListCanBeShot = async (req, res) => {

    const filters = VideoFileListQuery.create({
        page: 1,
        take: 10,
        sortKey: "createdAt",
        sortACS: "DESC",
        ...req.query
    });

    const { videoFiles, count } = await videoFileService.getEditorVideoDetailList(filters);

    return ResponseDTO.success(res, { videoFiles: VideoDetailResponse.create(videoFiles), count });
}

const getEqualizingCheckVideoFileListCanBeShot = async (req, res) => {

    const filters = VideoFileListQuery.create({
        page: 1,
        take: 10,
        sortKey: "createdAt",
        sortACS: "DESC",
        ...req.query
    });

    const { videoFiles, count } = await videoFileService.getEqualizingVideoDetailList(filters);

    return ResponseDTO.success(res, { videoFiles: VideoDetailResponse.create(videoFiles), count });
}

const getEqualizedCheckVideoFileListCanBeShot = async (req, res) => {

    const filters = VideoFileListQuery.create({
        page: 1,
        take: 10,
        sortKey: "createdAt",
        sortACS: "DESC",
        ...req.query
    });

    const { videoFiles, count } = await videoFileService.getEqualizedVideoDetailList(filters);

    return ResponseDTO.success(res, { videoFiles: VideoDetailResponse.create(videoFiles), count });
}

// get video file of path ******************

// const getVideoFileOfPath = async (req, res) => {
//     const { projectId } = req.params;
//     const { reqPath, shotStatus, videoStatus = null } = req.body;

//     const filters = {
//         shotStatus,
//         videoStatus,
//         projectId,
//         reqPath,
//         userId: null
//     }

//     const user = req.user;
//     if (
//         user.permission !== 'admin' &&
//         !user.access.includes("videos-full-access") &&
//         !user.access.includes("source-full-access")
//     ) {
//         filters.userId = req.user.id;
//     }

//     const videoFiles = await videoFileService.getDetailOfFolder(filters);

//     return ResponseDTO.success(res, videoFiles);
// }

const getInitCheckVideoFileOfPath = async (req, res) => {
    const { projectId } = req.params;
    const { reqPath } = req.body;

    const filters = {
        projectId,
        reqPath,
        userId: null
    }

    const user = req.user;
    if (
        user.permission !== 'admin' &&
        !user.access.includes("videos-full-access")
    ) {
        filters.userId = req.user.id;
    }

    console.log(111111, filters)
    const videoFiles = await videoFileService.getInitCheckDetailFolder(filters);

    return ResponseDTO.success(res, videoFiles);
}

const getEditorVideoFileOfPath = async (req, res) => {
    const { projectId } = req.params;
    const { reqPath } = req.body;

    const filters = {
        projectId,
        reqPath,
        userId: null
    }

    const videoFiles = await videoFileService.getEditorDetailFolder(filters);

    return ResponseDTO.success(res, videoFiles);
}

const getEqualizingVideoFileOfPath = async (req, res) => {
    const { projectId } = req.params;
    const { reqPath } = req.body;

    const filters = {
        projectId,
        reqPath,
        userId: null
    }

    const videoFiles = await videoFileService.getEqualizingDetailFolder(filters);

    return ResponseDTO.success(res, videoFiles);
}

const getEqualizedVideoFileOfPath = async (req, res) => {
    const { projectId } = req.params;
    const { reqPath } = req.body;

    const filters = {
        projectId,
        reqPath,
        userId: null
    }

    const videoFiles = await videoFileService.getEqualizedDetailFolder(filters);

    return ResponseDTO.success(res, videoFiles);
}

const getInitVideoFileOfPath = async (req, res) => {
    const { projectId } = req.params;
    const { reqPath } = req.body;

    const filters = {
        projectId,
        reqPath,
        userId: null
    }

    const user = req.user;
    if (
        user.permission !== 'admin' &&
        !user.access.includes("videos-full-access")
    ) {
        filters.userId = req.user.id;
    }

    const videoFiles = await videoFileService.getInitVideoDetailFolder(filters);

    return ResponseDTO.success(res, videoFiles);
}

const getCleaningVideoFileOfPath = async (req, res) => {
    const { projectId } = req.params;
    const { reqPath } = req.body;

    const filters = {
        projectId,
        reqPath,
        userId: null
    }

    const videoFiles = await videoFileService.getCleaningVideoDetailFolder(filters);

    return ResponseDTO.success(res, videoFiles);
}

const getCleanedVideoFileOfPath = async (req, res) => {
    const { projectId } = req.params;
    const { reqPath } = req.body;

    const filters = {
        projectId,
        reqPath,
        userId: null
    }

    const videoFiles = await videoFileService.getCleaningVideoDetailFolder(filters);

    return ResponseDTO.success(res, videoFiles);
}

const getVideoFileDetail = async (req, res) => {
    const { videoFileId } = req.params;
    const videoFiles = await videoFileService.getVideoFileDetail(videoFileId);
    return ResponseDTO.success(res, videoFiles)
}

const getInitVideoFileDetail = async (req, res) => {
    const { videoFileId } = req.params;

    const filters = {}
    filters.shotStatus = ['init-check', "editor"]

    const videoFiles = await videoFileService.getVideoFileDetail(videoFileId, filters);

    return ResponseDTO.success(res, videoFiles)
}

const getEditorVideoFileDetail = async (req, res) => {
    const { videoFileId } = req.params;
    const filters = {}
    filters.shotStatus = ['editor', 'equalizing']

    const videoFiles = await videoFileService.getVideoFileDetail(videoFileId, filters);

    return ResponseDTO.success(res, videoFiles);
}

const getEqualizingVideoFileDetail = async (req, res) => {
    const { videoFileId } = req.params;

    const filters = {}
    filters.shotStatus = ['equalizing', 'equalized']

    const videoFiles = await videoFileService.getVideoFileDetail(videoFileId, filters);

    return ResponseDTO.success(res, videoFiles)
}

const getVideoFileLog = async (req, res) => {
    const { videoFileId } = req.params;

    const logs = await videoFileService.getVideoFileLog(videoFileId);

    return ResponseDTO.success(res, logs)
}

const setImportantEncodeVideo = async (req, res) => {
    const { videoFileId } = req.params;
    const { isImportant } = req.body
    await videoFileService.setImportantEncodeVideo(+videoFileId, isImportant)
    return ResponseDTO.success(res)
}

// assign to user ***********************
const reassignProjectVideoFileBy = async (req, res) => {
    const { projectId, videoFileId, userId } = req.params;

    const videoFiles = await videoFileService.assignToUserByVideoFileIdProjectId(projectId, videoFileId, userId);

    return ResponseDTO.success(res, videoFiles)
}

const reassignVideosByPath = async (req, res) => {
    const { projectId, userId } = req.params;
    const { path } = req.body

    const videoFiles = await videoFileService.assignVideosPath2User(userId, projectId, path);

    return ResponseDTO.success(res, videoFiles)
}

const reassignVideosOfProject2User = async (req, res) => {
    const { projectId, userId } = req.params;

    const videoFiles = await videoFileService.assignVideosOfProject2User(projectId, userId);

    return ResponseDTO.success(res, videoFiles)
}

const reassignVideo2User = async (req, res) => {
    const { videoFileId, userId } = req.params;
    const videoFiles = await videoFileService.assignVideoFile2User(videoFileId, userId);
    return ResponseDTO.success(res, videoFiles)
}

const assignVideoToUser = async (req, res) => {
    const {
        userId,
        originalPath = "",
        projectId = null,
    } = req.body;
    const { videoFileId } = req.params;

    const videoFiles = await videoFileService.assignVideoFileByQuery(videoFileId, { userId, originalPath, projectId });

    return ResponseDTO.success(res, videoFiles)
}
// **************************************

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const setImportantVideosOfProject = async (req, res) => {
    const { projectId } = req.params;
    const { isImportant } = req.body

    await videoFileService.setImportantOfVideosOfProject(projectId, isImportant)

    return ResponseDTO.success(res, {});
}

const deleteVideoFile = async (req, res) => {
    const { videoFileId } = req.params;
    await videoFileService.deleteVideoFile(videoFileId);
    return ResponseDTO.success(res, {});
}

const deleteVideoMainFile = async (req, res) => {
    const { projectId } = req.params;
    await videoFileService.deleteMainFileOfProject(projectId);
    return ResponseDTO.success(res);
}

const uploadVideoFile = async (req, res) => {
    await videoFileService.uploadVideoFile(req);
    return ResponseDTO.success(res, {});
}

const reassignVideoFile = async (req, res) => {
    const { videoFileId } = req.params
    await videoFileService.uploadVideoFile(req, { videoId: videoFileId });
    return ResponseDTO.success(res, {});
}

const showVideoFile = async (req, reply) => {
    try {
        const { videoFileId } = req.params;
        const { videoPath, videoSize } = await videoFileService.getVideoFileToShow(videoFileId, req, reply);

        if (!fs.existsSync(videoPath)) {
            return reply.status(404).send("Video file not found");
        }

        const range = req.headers.range;
        if (!range) {
            return reply.status(400).send("Requires Range header");
        }

        const CHUNK_SIZE = 10 ** 6;
        let start = Number(range.replace(/\D/g, ""));
        let end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        const contentLength = end - start + 1;

        // Fastify's way to handle streams with headers
        reply
            .code(206)
            .headers({
                "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": "video/mp4",
            });

        const videoStream = fs.createReadStream(videoPath, { start, end });
        return reply.send(videoStream);
    }
    catch (err) {
        reply.status(500).send("Internal server error");
    }
}

const updateFileInfo = async (req, res) => {
    const { videoFileId } = req.params;
    const body = req.body;

    await videoFileService.updateFileInfo_Service(videoFileId, body)
    return ResponseDTO.success(res)
}

module.exports = {
    getVideoFileList,
    getVideoFileListCanBeShot,
    getInitCheckVideoFileListCanBeShot,
    getEditorCheckVideoFileListCanBeShot,
    getEqualizingCheckVideoFileListCanBeShot,
    getEqualizedCheckVideoFileListCanBeShot,
    getInitCheckVideoFileOfPath,
    getEditorVideoFileOfPath,
    getEqualizingVideoFileOfPath,
    getEqualizedVideoFileOfPath,
    getInitVideoFileOfPath,
    getCleaningVideoFileOfPath,
    getCleanedVideoFileOfPath,
    getVideoFileDetail,
    getInitVideoFileDetail,
    getEditorVideoFileDetail,
    getEqualizingVideoFileDetail,
    getVideoFileLog,
    setImportantEncodeVideo,
    reassignProjectVideoFileBy,
    reassignVideosByPath,
    reassignVideosOfProject2User,
    reassignVideo2User,
    assignVideoToUser,
    setImportantVideosOfProject,
    deleteVideoFile,
    deleteVideoMainFile,
    uploadVideoFile,
    reassignVideoFile,
    showVideoFile,
    updateFileInfo
};
