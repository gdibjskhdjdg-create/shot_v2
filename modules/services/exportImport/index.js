const ExportImportService = require("./ExportImport.service")
const { shotLogService } = require("../../services/shotList")
const ShotService = require("../../services/shotList/Shot.service")
const EqualizerService = require("../../services/shotList/Equalizer.service")
const VideoDetailLogService = require("../../services/videoDetail/VideoDetailLog.service")
const VideoDetailService = require("../../services/videoDetail/VideoDetail.service")
const VideoFileService = require("../../services/videoFile/VideoFile.service")

const exportImportService = new ExportImportService(
    shotLogService, 
    new ShotService(), 
    new EqualizerService(), 
    new VideoDetailLogService(),
    new VideoDetailService(new VideoFileService(), new ShotService()),
);

module.exports = {
    exportImportService,
}