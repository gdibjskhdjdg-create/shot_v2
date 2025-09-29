
const { log } = require("../../../helper/showLog");
const { videoDetailLogService } = require("../../services/videoDetail/index");

class VideoDetail_Listener {
    constructor(emitter) {
        log("[+] [Listener] Video Detail Log");

        emitter.on('updateVideoDetailStatus', ({ videoFileId, userId, body }) => videoDetailLogService.createVideoDetailLog({ videoFileId, userId, body }));
        // emitter.on('createVideoDetailLog', ({ videoFileId, userId, body }) => videoDetailLogService.createVideoDetailLog({ videoFileId, userId, body }));
    }
}

module.exports = VideoDetail_Listener;