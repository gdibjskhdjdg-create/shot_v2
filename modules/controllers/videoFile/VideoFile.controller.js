const fs = require('fs');

const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const { videoFileService } = require("../../services/videoFile/index");
const VideoFile_DTO = require('../../dto/videoFile/VideoFile.dto');
const VideoFileListQuery_DTO = require('../../dto/videoFile/VideoFileListQuery.dto');
const ErrorResult = require('../../../helper/error.tool');
const VideoDetail_DTO = require('../../dto/videoDetail/VideoDetail.dto');

class VideoFileController {

    async getVideoFileList(req, res) {
        const query = getDataFromReqQuery(req);
        const filters = VideoFileListQuery_DTO.create({
            page: 1,
            take: 10,
            sortKey: "createdAt",
            sortACS: "DESC",
            ...query
        });

        const user = req.user;
        if (user.permission !== 'admin' &&
            !user.access.includes("videos-full-access") &&
            !user.access.includes("source-full-access")
        ) {
            filters.userId = user.id;
        }

        const { videoFiles, count } = await videoFileService.getVideoFileList(filters);

        return BaseController.ok(res, { videoFiles: VideoFile_DTO.create(videoFiles), count });
    }

    async getVideoFileListCanBeShot(req, res) {

        const query = getDataFromReqQuery(req);
        const filters = VideoFileListQuery_DTO.create({
            page: 1,
            take: 10,
            sortKey: "createdAt",
            sortACS: "DESC",
            status: "accept",
            ...query
        });

        const user = req.user;
        const isSetUserId = user.permission !== 'admin' &&
            !user.access.includes("videos-full-access") &&
            !user.access.includes("source-full-access")

        if (isSetUserId) {
            filters.userId = user.id;
        }

        const { videoFiles, count } = await videoFileService.getVideoDetailList(filters);

        return BaseController.ok(res, { videoFiles: VideoDetail_DTO.create(videoFiles), count });
    }

    async getInitCheckVideoFileListCanBeShot(req, res) {
        const query = getDataFromReqQuery(req);
        const filters = VideoFileListQuery_DTO.create({
            page: 1,
            take: 10,
            shotStatus: "init-check",
            sortKey: "createdAt",
            sortACS: "DESC",
            ...query
        });

        const user = req.user;
        const hasNotFullAccess = user.permission !== 'admin' &&
            !user.access.includes("shot-full-access");

        if (hasNotFullAccess) {
            filters.userId = user.id;
        }
        const { videoFiles, count } = await videoFileService.getInitVideoDetailList(filters);

        return BaseController.ok(res, { videoFiles: VideoDetail_DTO.create(videoFiles), count });
    }

    async getEditorCheckVideoFileListCanBeShot(req, res) {
        const query = getDataFromReqQuery(req);
        const filters = VideoFileListQuery_DTO.create({
            page: 1,
            take: 10,
            sortKey: "createdAt",
            sortACS: "DESC",
            ...query
        });

        const { videoFiles, count } = await videoFileService.getEditorVideoDetailList(filters);

        return BaseController.ok(res, { videoFiles: VideoDetail_DTO.create(videoFiles), count });
    }

    async getEqualizingCheckVideoFileListCanBeShot(req, res) {
        const query = getDataFromReqQuery(req);
        const filters = VideoFileListQuery_DTO.create({
            page: 1,
            take: 10,
            sortKey: "createdAt",
            sortACS: "DESC",
            ...query
        });

        const { videoFiles, count } = await videoFileService.getEqualizingVideoDetailList(filters);

        return BaseController.ok(res, { videoFiles: VideoDetail_DTO.create(videoFiles), count });
    }

    async getEqualizedCheckVideoFileListCanBeShot(req, res) {
        const query = getDataFromReqQuery(req);
        const filters = VideoFileListQuery_DTO.create({
            page: 1,
            take: 10,
            sortKey: "createdAt",
            sortACS: "DESC",
            ...query
        });

        const { videoFiles, count } = await videoFileService.getEqualizedVideoDetailList(filters);

        return BaseController.ok(res, { videoFiles: VideoDetail_DTO.create(videoFiles), count });
    }

    // get video file of path ******************

    // async getVideoFileOfPath(req, res) {
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

    //     return BaseController.ok(res, videoFiles);
    // }

    async getInitCheckVideoFileOfPath(req, res) {
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

        return BaseController.ok(res, videoFiles);
    }


    async getEditorVideoFileOfPath(req, res) {
        const { projectId } = req.params;
        const { reqPath } = req.body;

        const filters = {
            projectId,
            reqPath,
            userId: null
        }

        const videoFiles = await videoFileService.getEditorDetailFolder(filters);

        return BaseController.ok(res, videoFiles);
    }


    async getEqualizingVideoFileOfPath(req, res) {
        const { projectId } = req.params;
        const { reqPath } = req.body;

        const filters = {
            projectId,
            reqPath,
            userId: null
        }

        const videoFiles = await videoFileService.getEqualizingDetailFolder(filters);

        return BaseController.ok(res, videoFiles);
    }

    async getEqualizedVideoFileOfPath(req, res) {
        const { projectId } = req.params;
        const { reqPath } = req.body;

        const filters = {
            projectId,
            reqPath,
            userId: null
        }

        const videoFiles = await videoFileService.getEqualizedDetailFolder(filters);

        return BaseController.ok(res, videoFiles);
    }

    async getEqualizedVideoFileOfPath(req, res) {
        const { projectId } = req.params;
        const { reqPath } = req.body;

        const filters = {
            projectId,
            reqPath,
            userId: null
        }

        const videoFiles = await videoFileService.getEqualizedDetailFolder(filters);

        return BaseController.ok(res, videoFiles);
    }

    async getInitVideoFileOfPath(req, res) {
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

        return BaseController.ok(res, videoFiles);
    }

    async getCleaningVideoFileOfPath(req, res) {
        const { projectId } = req.params;
        const { reqPath } = req.body;

        const filters = {
            projectId,
            reqPath,
            userId: null
        }

        const videoFiles = await videoFileService.getCleaningVideoDetailFolder(filters);

        return BaseController.ok(res, videoFiles);
    }

    async getCleaningVideoFileOfPath(req, res) {
        const { projectId } = req.params;
        const { reqPath } = req.body;

        const filters = {
            projectId,
            reqPath,
            userId: null
        }

        const videoFiles = await videoFileService.getCleaningVideoDetailFolder(filters);

        return BaseController.ok(res, videoFiles);
    }

    async getCleanedVideoFileOfPath(req, res) {
        const { projectId } = req.params;
        const { reqPath } = req.body;

        const filters = {
            projectId,
            reqPath,
            userId: null
        }

        const videoFiles = await videoFileService.getCleaningVideoDetailFolder(filters);

        return BaseController.ok(res, videoFiles);
    }

    async getVideoFileDetail(req, res) {
        const { videoFileId } = req.params;
        const videoFiles = await videoFileService.getVideoFileDetail(videoFileId);
        return BaseController.ok(res, videoFiles)
    }

    async getInitVideoFileDetail(req, res) {
        const { videoFileId } = req.params;

        const filters = {}
        filters.shotStatus = ['init-check', "editor"]

        const videoFiles = await videoFileService.getVideoFileDetail(videoFileId, filters);

        return BaseController.ok(res, videoFiles)
    }

    async getEditorVideoFileDetail(req, res) {
        const { videoFileId } = req.params;
        const filters = {}
        filters.shotStatus = ['editor', 'equalizing']

        const videoFiles = await videoFileService.getVideoFileDetail(videoFileId, filters);

        return BaseController.ok(res, videoFiles);
    }

    async getEqualizingVideoFileDetail(req, res) {
        const { videoFileId } = req.params;

        const filters = {}
        filters.shotStatus = ['equalizing', 'equalized']

        const videoFiles = await videoFileService.getVideoFileDetail(videoFileId, filters);

        return BaseController.ok(res, videoFiles)
    }

    async getVideoFileLog(req, res) {
        const { videoFileId } = req.params;

        const logs = await videoFileService.getVideoFileLog(videoFileId);

        return BaseController.ok(res, logs)
    }

    async setImportantEncodeVideo(req, res) {
        const { videoFileId } = req.params;
        const { isImportant } = req.body
        await videoFileService.setImportantEncodeVideo(+videoFileId, isImportant)
        return BaseController.ok(res)
    }

    // assign to user ***********************
    async reassignProjectVideoFileBy(req, res) {

        const { projectId, videoFileId, userId } = req.params;


        const videoFiles = await videoFileService.assignToUserByVideoFileIdProjectId(projectId, videoFileId, userId);

        return BaseController.ok(res, videoFiles)
    }

    async reassignVideosByPath(req, res) {
        const { projectId, userId } = req.params;
        const { path } = req.body

        const videoFiles = await videoFileService.assignVideosPath2User(userId, projectId, path);

        return BaseController.ok(res, videoFiles)
    }

    async reassignVideosOfProject2User(req, res) {
        const { projectId, userId } = req.params;

        const videoFiles = await videoFileService.assignVideosOfProject2User(projectId, userId);

        return BaseController.ok(res, videoFiles)
    }

    async reassignVideo2User(req, res) {
        const { videoFileId, userId } = req.params;
        const videoFiles = await videoFileService.assignVideoFile2User(videoFileId, userId);
        return BaseController.ok(res, videoFiles)
    }

    async assignVideoToUser(req, res) {
        const {
            userId,
            originalPath = "",
            projectId = null,
        } = req.body;
        const { videoFileId } = req.params;

        const videoFiles = await videoFileService.assignVideoFileByQuery(videoFileId, { userId, originalPath, projectId });

        return BaseController.ok(res, videoFiles)
    }
    // **************************************

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async setImportantVideosOfProject(req, res) {
        const { projectId } = req.params;
        const { isImportant } = req.body

        await videoFileService.setImportantOfVideosOfProject(projectId, isImportant)

        return BaseController.ok(res, {});

    }

    async deleteVideoFile(req, res) {
        const { videoFileId } = req.params;
        await videoFileService.deleteVideoFile(videoFileId);
        return BaseController.ok(res, {});
    }

    async deleteVideoMainFile(req, res) {
        const { projectId } = req.params;
        await videoFileService.deleteMainFileOfProject(projectId);
        return BaseController.ok(res);
    }

    async uploadVideoFile(req, res) {
        await videoFileService.uploadVideoFile(req);
        return BaseController.ok(res, {});
    }

    async reassignVideoFile(req, res) {
        const { videoFileId } = req.params
        await videoFileService.uploadVideoFile(req, { videoId: videoFileId });
        return BaseController.ok(res, {});
    }

    async showVideoFile(req, reply) {
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

    async updateFileInfo(req, res) {
        const { videoFileId } = req.params;
        const body = req.body;

        await videoFileService.updateFileInfo_Service(videoFileId, body)
        return BaseController.ok(res)
    }
}

module.exports = new VideoFileController();
