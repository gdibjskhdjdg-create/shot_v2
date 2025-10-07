const { log } = require("../../../helper/showLog");
const { VideoInfoService } = require("../../services/videoInfo/index");

class VideoInfo_Listener {
    constructor(emitter) {
        log("[+] [Listener] Video Info");

        emitter.on('moveAndStoreFile', (video) => VideoInfoService.assignVideoFile(video));
        emitter.on('assignVideo2Shot', (video) => VideoInfoService.assignVideoFile(video))
        // emitter.on('videoCreate', (video) => { VideoInfoService.newVideoFile(video) })
        emitter.on('createVideoFromImportExcelShot', (video) => { VideoInfoService.makeFromVideo(video) })
        // emitter.on('shotCreate', (shot) => { VideoInfoService.updateStatus({ videoFileId: shot.videoFileId }) })
        emitter.on('updateShot', (shot) => { VideoInfoService.updateStatus({ videoFileId: shot.videoFileId }) })
    }
}

module.exports = VideoInfo_Listener;