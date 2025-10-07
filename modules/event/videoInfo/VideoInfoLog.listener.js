
const { log } = require("../../../helper/showLog");
const { VideoInfoLogService } = require("../../services/videoInfo/index");

class VideoInfoLog_Listener {
    constructor(emitter) {
        log("[+] [Listener] Video Info Log");

        emitter.on('updateVideoInfoStatus', ({ videoFileId, userId, body }) => VideoInfoLogService.createLog({ videoFileId, userId, body }));
        // emitter.on('createVideoDetailLog', ({ videoFileId, userId, body }) => VideoInfoLogService.createLog({ videoFileId, userId, body }));
    }
}

module.exports = VideoInfoLog_Listener;