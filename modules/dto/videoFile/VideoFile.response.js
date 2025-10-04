const BaseResponse = require("../../_default/BaseResponse");
const { VideoFile } = require("../../_default/model");
const moment = require("jalali-moment");
const { videoFileService } = require("../../services/videoFile");

class VideoFileResponse extends BaseResponse {

    constructor(data) {
        super(data);

        let statusText = VideoFile.StatusText(data);

        this.id = this.setValue(["id"], 'number');
        this.originalName = this.setValue(["originalName"], 'string');
        this.originalPath = this.setValue(["originalPath"], 'string');
        this.name = this.setValue(["name"], 'string');
        this.format = this.setValue(["format"], 'string');
        this.width = this.setValue(["width"], 'string');
        this.height = this.setValue(["height"], 'string');
        this.duration = this.setValue(["duration"], 'string');
        this.status = this.setValue(["status"], 'number');
        this.shotCount = this.setValue(["shotCount"], 'number');
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

module.exports = VideoFileResponse