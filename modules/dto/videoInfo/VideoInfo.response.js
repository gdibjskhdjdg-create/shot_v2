const moment = require("jalali-moment");
const { videoFileService } = require("../../services/videoFile");
const BaseResponse = require("../../_default/BaseResponse");

class VideoInfoResponse extends BaseResponse {

    constructor(data) {
        super(data);

        this.id = this.setValue(["id", "videoFileId"], 'number');
        this.videoFileId = this.setValue(["videoFileId"], 'number');
        this.title = this.setValue(["title"], 'string');
        this.status = this.setValue(["status"], 'string');
        this.user = data.user;
        this.project = data.project;
        this.shotStatus = data?.shotStatus;
        this.videoStatus = data?.videoStatus;

        this.name = data.videoFile.name;
        this.originalName = data.videoFile.originalName;
        this.format = data.videoFile.format;
        this.width = data.videoFile.width;
        this.height = data.videoFile.height;
        this.shotCount = data.videoFile.shotCount;
        this.duration = data.videoFile.duration;
        this.videoFileUrl = videoFileService.getVideoFileURL(data.videoFile.id);

        this.createdAt = moment(data.createdAt).format("jYYYY/jMM/jDD HH:mm");
        this.updatedAt = moment(data.updatedAt).format("jYYYY/jMM/jDD HH:mm");
    }
}

module.exports = VideoInfoResponse