const { log } = require("../../../helper/showLog");
const { videoFileService } = require("../../services/videoFile/index");
const { shotLogService } = require("../../services/shotList/index");

class VideoFile_Listener {
    constructor(emitter) {
        log("[+] [Listener] VideoFile");
        emitter.on('createShotLog', (data) => { shotLogService.createShotLog(data) });
        // emitter.on('updateShotCount', (data) => videoFileService.updateVideoFileShotCount(data));
        // emitter.on('deleteVideoDetail', (data) => videoFileService.deleteVideoFile(data.videoFileId))
        emitter.on('shotCreate', (data) => videoFileService.updateVideoFileShotCount(data.videoFileId));
        emitter.on('deleteShot', (data) => videoFileService.updateVideoFileShotCount(data.videoFileId));
        emitter.on('deleteShotsVideoFile', (videoFileId) => videoFileService.updateVideoFileShotCount(videoFileId));
        emitter.on('updateShotCountOfProject', (data) => videoFileService.updateVideoFileShotCountOfProject(data));
    }
}

module.exports = VideoFile_Listener;