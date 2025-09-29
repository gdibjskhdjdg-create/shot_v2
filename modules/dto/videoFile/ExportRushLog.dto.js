const DTO = require("../../_default/DTO");
const moment = require("jalali-moment");

class ExportRushLog_DTO extends DTO {

    constructor(data){
        super(data);

        this.exportId = this.validate(["exportId", 'string']);
        this.objectId = this.validate(["objectId", 'number']);
        this.type = this.validate(["type", 'string']);
        this.log = this.validate(["log", 'string']);
        this.status = this.validate(["status", 'string']);
        this.createdAt = moment(data.createdAt).format("jYYYY/jMM/jDD HH:mm:ss");
    }
}

module.exports = ExportRushLog_DTO