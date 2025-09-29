const DTO = require("../../_default/DTO");
const moment = require("jalali-moment");
const ExportRushLog_DTO = require("./ExportRushLog.dto");

class ExportFile_DTO extends DTO {

    constructor(data) {
        super(data);

        this.id = this.validate(["id", 'number']);
        this.title = this.validate(["title", 'string']);
        this.userId = this.validate(['userId', 'string'])
        this.code = this.validate(["code", 'string']);
        this.downloadUrl = this.validate(["downloadUrl", 'number']);
        this.lastCommand = this.validate(["lastCommand", 'string']);
        this.isProduct = data.isProduct == 1;
        this.productId = this.validate(["productId", 'string']);
        this.productStatus = this.validate(["productStatus", 'string']);
        this.bitrate = this.validate(["bitrate", 'number']);
        this.status = this.validate(["status", 'string']);
        this.isImportant = data.isImportant;
        this.rushLog = data.toJSON().lastRush ? ExportRushLog_DTO.create(data.toJSON().lastRush) : null
        this.createdAt = moment(data.createdAt).format("jYYYY/jMM/jDD HH:mm:ss");
    }
}

module.exports = ExportFile_DTO