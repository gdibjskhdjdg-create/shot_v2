const ExportImportService = require("./ExportImport.service")
const { shotLogService } = require("../../services/shotList")
const ShotService = require("../../services/shotList/Shot.service")
const EqualizerService = require("../../services/shotList/Equalizer.service")
const VideoInfoLogService = require("../../services/videoInfo/VideoInfoLog.service")
const VideoInfoService = require("../../services/videoInfo/VideoInfo.service")
const VideoFileService = require("../../services/videoFile/VideoFile.service")

const exportImportService = new ExportImportService(
    shotLogService, 
    new ShotService(), 
    new EqualizerService(), 
    new VideoInfoLogService(),
    new VideoInfoService(new VideoFileService(), new ShotService()),
);

module.exports = {
    exportImportService,
}