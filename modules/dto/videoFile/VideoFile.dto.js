const DTO = require("../../_default/DTO");
const { VideoFile } = require("../../_default/model");
const moment = require("jalali-moment");
const { videoFileService } = require("../../services/videoFile");

class VideoFile_DTO extends DTO {

    constructor(data) {
        super(data);

        let statusText = VideoFile.StatusText(data);

        this.id = this.validate(["id"], 'number');
        this.originalName = this.validate(["originalName"], 'string');
        this.originalPath = this.validate(["originalPath"], 'string');
        this.name = this.validate(["name"], 'string');
        this.format = this.validate(["format"], 'string');
        this.width = this.validate(["width"], 'string');
        this.height = this.validate(["height"], 'string');
        this.duration = this.validate(["duration"], 'string');
        this.status = this.validate(["status"], 'number');
        this.shotCount = this.validate(["shotCount"], 'number');
        this.duration = this.duration
        this.statusText = statusText;
        this.user = data.user;
        this.isImportant = data.isImportant;
        this.project = data.project;
        this.shotStatus = data?.shotStatus
        this.videoStatus = data?.videoStatus
        this.videoFileUrl = videoFileService.getVideoFileURL(this.id);

        this.referralAt = data.referralAt && moment(data.referralAt).format("jYYYY/jMM/jDD HH:mm");
        this.createdAt = moment(data.createdAt).format("jYYYY/jMM/jDD HH:mm");
        this.updatedAt = moment(data.updatedAt).format("jYYYY/jMM/jDD HH:mm");
    }
}

module.exports = VideoFile_DTO