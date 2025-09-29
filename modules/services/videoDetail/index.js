const VideoFileService = require('../videoFile/VideoFile.service');
const ShotService = require('../shotList/Shot.service');
const VideoDetailService = require('../videoDetail/VideoDetail.service')
const VideoDetailScoreService = require('./VideoDetailScore.service');
const VideoDetailLogService = require('..//videoDetail/VideoDetailLog.service');
const VideoDetailExport_Service = require('./VideoDetailExport.service');
const VideoDetailImportFileService = require('../videoDetail/VideoDetailImportFile.service');


const videoDetailLogService = new VideoDetailLogService()
const videoDetailScoreService = new VideoDetailScoreService()
const shotService = new ShotService(new VideoFileService())
const videoFileService = new VideoFileService(new ShotService());
const videoDetailService = new VideoDetailService(videoFileService, shotService, videoDetailScoreService)
const videoDetailExportService = new VideoDetailExport_Service(videoDetailService, videoDetailScoreService)
const videoDetailImportService = new VideoDetailImportFileService(new VideoDetailService())

module.exports = {
    shotService,
    videoFileService,
    videoDetailService,
    videoDetailScoreService,
    videoDetailLogService,
    videoDetailExportService,
    videoDetailImportService
}