const ProjectService = require("./Project.service")
const { shotLogService } = require("../shotList")
const ShotService = require("../shotList/Shot.service")
const EqualizerService = require("../shotList/Equalizer.service")
const VideoDetailLogService = require("../videoDetail/VideoDetailLog.service")
const VideoDetailService = require("../videoDetail/VideoDetail.service")
const VideoFileService = require("../videoFile/VideoFile.service")

const projectService = new ProjectService(
    shotLogService, 
    new ShotService(), 
    new EqualizerService(), 
    new VideoDetailLogService(),
    new VideoDetailService(new VideoFileService(), new ShotService()),
);

module.exports = {
    projectService,
}