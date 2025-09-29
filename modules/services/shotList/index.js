const VideoFileService = require("../videoFile/VideoFile.service");
const ProjectService = require("../project/Project.service");
const ShotService = require("../shotList/Shot.service");
const ShotScoreService = require("./ShotScore.service");
const ShotLogService = require("./ShotLog.service");
const EqualizerService = require("./Equalizer.service");
const ShotExportService = require("./ShotExport.service");
const VideoDetailLogService = require("../videoDetail/VideoDetailLog.service")

const shotLogService = new ShotLogService(new ProjectService(), new VideoDetailLogService());
const shotScoreService = new ShotScoreService()
const shotService = new ShotService(new VideoFileService());
const shotExportService = new ShotExportService(new ShotService(new VideoFileService()), new ShotScoreService());
const equalizerService = new EqualizerService(new VideoFileService(), new ShotService());

module.exports = {
    shotService,
    shotScoreService,
    equalizerService,
    shotLogService,
    shotExportService
}