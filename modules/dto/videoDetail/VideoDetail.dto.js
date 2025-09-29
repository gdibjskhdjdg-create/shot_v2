const DTO = require("../../_default/DTO");
const { VideoFile } = require("../../_default/model");
const moment = require("jalali-moment");
const { videoFileService } = require("../../services/videoFile");

class VideoDetail_DTO extends DTO {

    constructor(data) {
        super(data);

        this.id = this.validate(["id", "videoFileId"], 'number');
        this.videoFileId = this.validate(["videoFileId"], 'number');
        this.title = this.validate(["title"], 'string');
        this.status = this.validate(["status"], 'string');
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

module.exports = VideoDetail_DTO