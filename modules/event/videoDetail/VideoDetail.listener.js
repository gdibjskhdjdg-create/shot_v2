const { log } = require("../../../helper/showLog");
const { videoDetailService } = require("../../services/videoDetail/index");

class VideoDetail_Listener {
    constructor(emitter) {
        log("[+] [Listener] Video Detail");

        emitter.on('moveAndStoreFile', (video) => videoDetailService.assignVideoFile(video));
        emitter.on('assignVideo2Shot', (video) => videoDetailService.assignVideoFile(video))
        // emitter.on('videoCreate', (video) => { videoDetailService.newVideoDetailForVideoFile(video) })
        emitter.on('createVideoFromImportExcelShot', (video) => { videoDetailService.makeVideoDetailFromVideo(video) })
        // emitter.on('shotCreate', (shot) => { videoDetailService.updateStatus({ videoFileId: shot.videoFileId }) })
        emitter.on('updateShot', (shot) => { videoDetailService.updateStatus({ videoFileId: shot.videoFileId }) })
    }
}

module.exports = VideoDetail_Listener;