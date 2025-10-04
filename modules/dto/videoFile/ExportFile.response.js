const BaseResponse = require("../../_default/BaseResponse");
const moment = require("jalali-moment");
const ExportRushLogResponse = require("./ExportRushLog.response");

class ExportFileResponse extends BaseResponse {

    constructor(data) {
        super(data);

        this.id = this.setValue(["id", 'number']);
        this.title = this.setValue(["title", 'string']);
        this.userId = this.setValue(['userId', 'string'])
        this.code = this.setValue(["code", 'string']);
        this.downloadUrl = this.setValue(["downloadUrl", 'number']);
        this.lastCommand = this.setValue(["lastCommand", 'string']);
        this.isProduct = data.isProduct == 1;
        this.productId = this.setValue(["productId", 'string']);
        this.productStatus = this.setValue(["productStatus", 'string']);
        this.bitrate = this.setValue(["bitrate", 'number']);
        this.status = this.setValue(["status", 'string']);
        this.isImportant = data.isImportant;
        this.rushLog = data.toJSON().lastRush ? ExportRushLogResponse.create(data.toJSON().lastRush) : null
        this.createdAt = moment(data.createdAt).format("jYYYY/jMM/jDD HH:mm:ss");
    }
}

module.exports = ExportFileResponse