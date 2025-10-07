const VideoFile_Service = require('../videoFile/VideoFile.service');
const Shot_Service = require('../shotList/Shot.service');
const VideoInfo_Service = require('./VideoInfo.service')
const VideoInfoLog_Service = require('./VideoInfoLog.service');
const VideoInfoScore_Service = require('./VideoInfoScore.service');
const VideoInfoExport_Service = require('./VideoInfoExport.service');
const VideoInfoImportFile_Service = require('./VideoInfoImportFile.service');


const shotService = new Shot_Service(new VideoFile_Service())
const videoFileService = new VideoFile_Service(new Shot_Service());
const VideoInfoLogService = new VideoInfoLog_Service()
const VideoInfoScoreService = new VideoInfoScore_Service()
const VideoInfoService = new VideoInfo_Service(videoFileService, shotService, VideoInfoScoreService)
const VideoInfoExportService = new VideoInfoExport_Service(VideoInfoService, VideoInfoScoreService)
const VideoInfoImportService = new VideoInfoImportFile_Service(new VideoInfo_Service())

module.exports = {
    shotService,
    videoFileService,
    VideoInfoService,
    VideoInfoScoreService,
    VideoInfoLogService,
    VideoInfoExportService,
    VideoInfoImportService
}