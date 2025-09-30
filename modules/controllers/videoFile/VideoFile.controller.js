const fs = require('fs');
const { promisify } = require('util');
const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const videoFileService = require("../../services/videoFile/VideoFile.service");
const VideoFile_DTO = require('../../dto/videoFile/VideoFile.dto');
const VideoFileListQuery_DTO = require('../../dto/videoFile/VideoFileListQuery.dto');
const VideoDetail_DTO = require('../../dto/videoDetail/VideoDetail.dto');

const stat = promisify(fs.stat);

// Helper to enforce user permissions on filters
const applyUserPermissionFilter = (filters, user, accessLevels = ["videos-full-access", "source-full-access"]) => {
    const hasFullAccess = user.permission === 'admin' || accessLevels.every(acc => user.access.includes(acc));
    if (!hasFullAccess) {
        return { ...filters, userId: user.id };
    }
    return filters;
};

// Get a paginated list of all video files
const getVideoFiles = async (req, res) => {
    const query = getDataFromReqQuery(req);
    let filters = VideoFileListQuery_DTO.create({ page: 1, take: 10, sortKey: "createdAt", sortACS: "DESC", ...query });
    
    filters = applyUserPermissionFilter(filters, req.user);

    const { videoFiles, count } = await videoFileService.list(filters);
    const videoFilesDto = VideoFile_DTO.create(videoFiles);
    return BaseController.ok(res, { rows: videoFilesDto, count });
};

// Get a paginated list of source video files
const getSourceVideoFiles = async (req, res) => {
    const query = getDataFromReqQuery(req);
    let filters = VideoFileListQuery_DTO.create({ page: 1, take: 10, sortKey: "createdAt", sortACS: "DESC", ...query, status: "source" });
    
    filters = applyUserPermissionFilter(filters, req.user);

    const { videoFiles, count } = await videoFileService.list(filters);
    const videoFilesDto = VideoFile_DTO.create(videoFiles);
    return BaseController.ok(res, { rows: videoFilesDto, count });
};

// Get a paginated list of project video files
const getProjectVideoFiles = async (req, res) => {
    const query = getDataFromReqQuery(req);
    let filters = VideoFileListQuery_DTO.create({ page: 1, take: 10, sortKey: "createdAt", sortACS: "DESC", ...query, status: "project" });
    
    filters = applyUserPermissionFilter(filters, req.user, ["videos-full-access", "project-full-access"]);

    const { videoFiles, count } = await videoFileService.list(filters);
    const videoFilesDto = VideoFile_DTO.create(videoFiles);
    return BaseController.ok(res, { rows: videoFilesDto, count });
};

// Get details for a single video file
const getVideoFile = async (req, res) => {
    const { id } = req.params;
    const videoFile = await videoFileService.getOne(id);
    const videoDetailDto = VideoDetail_DTO.create(videoFile.videoDetail);
    return BaseController.ok(res, videoDetailDto);
};

// Stream a video file with support for range requests
const streamVideoFile = async (req, res) => {
    const { id } = req.params;
    try {
        const video = await videoFileService.getOne(id);
        const videoPath = video.originalFile;
        const { size } = await stat(videoPath);
        const range = req.headers.range;

        if (range) {
            let [start, end] = range.replace(/bytes=/, '').split('-');
            start = parseInt(start, 10);
            end = end ? parseInt(end, 10) : size - 1;

            if (!isNaN(start)) {
                res.writeHead(206, {
                    'Content-Range': `bytes ${start}-${end}/${size}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': (end - start) + 1,
                    'Content-Type': 'video/mp4',
                });
                fs.createReadStream(videoPath, { start, end }).pipe(res);
            } else {
                return res.status(400).send('Range Not Satisfiable');
            }
        } else {
            res.writeHead(200, {
                'Content-Length': size,
                'Content-Type': 'video/mp4',
            });
            fs.createReadStream(videoPath).pipe(res);
        }
    } catch (error) {
        // Handle errors like file not found
        console.error("Streaming error:", error);
        return res.status(404).send("Video not found");
    }
};

// Delete a video file by its ID
const deleteVideoFile = async (req, res) => {
    const { id } = req.params;
    await videoFileService.deleteOne(id);
    return BaseController.ok(res, { message: 'Video file deleted successfully.' });
}

module.exports = {
    getVideoFiles,
    getSourceVideoFiles,
    getProjectVideoFiles,
    getVideoFile,
    streamVideoFile,
    deleteVideoFile
};