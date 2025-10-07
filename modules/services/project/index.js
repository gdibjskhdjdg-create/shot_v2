const ProjectService = require("./Project.service")
const { shotLogService } = require("../shotList")
const ShotService = require("../shotList/Shot.service")
const EqualizerService = require("../shotList/Equalizer.service")
const VideoInfoLogService = require("../videoInfo/VideoInfoLog.service")
const VideoInfoService = require("../videoInfo/VideoInfo.service")
const VideoFileService = require("../videoFile/VideoFile.service")

const projectService = new ProjectService(
    shotLogService, 
    new ShotService(), 
    new EqualizerService(), 
    new VideoInfoLogService(),
    new VideoInfoService(new VideoFileService(), new ShotService()),
);

module.exports = {
    projectService,
}