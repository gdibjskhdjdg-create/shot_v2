const ShotService = require("../shotList/Shot.service");
const VideoFileService = require("./VideoFile.service")
const VideoDetailService = require("../videoDetail/VideoDetail.service")
const ExportVideoService = require("./ExportVideo.service")
const VideoTemplateService = require("./VideoTemplate.service")
const RashService = require("./Rash.service");
const VideoEditor_Service = require("./VideoEditor.service");

const videoFileService = new VideoFileService(new ShotService(), new VideoDetailService());
const videoEditorService = new VideoEditor_Service(
    new ExportVideoService(),
    new VideoFileService(),
    new VideoTemplateService(),
    new ShotService(new VideoFileService()),
);

const exportVideoService = new ExportVideoService(videoEditorService);
const videoTemplateService = new VideoTemplateService();
const rashService = new RashService(new ExportVideoService(), new ShotService(new VideoFileService()));

module.exports = {
    videoFileService,
    exportVideoService,
    videoEditorService,
    videoTemplateService,
    rashService,
}