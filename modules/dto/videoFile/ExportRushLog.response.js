const BaseResponse = require("../../_default/BaseResponse");
const moment = require("jalali-moment");

class ExportRushLogResponse extends BaseResponse {

    constructor(data){
        super(data);

        this.exportId = this.setValue(["exportId", 'string']);
        this.objectId = this.setValue(["objectId", 'number']);
        this.type = this.setValue(["type", 'string']);
        this.log = this.setValue(["log", 'string']);
        this.status = this.setValue(["status", 'string']);
        this.createdAt = moment(data.createdAt).format("jYYYY/jMM/jDD HH:mm:ss");
    }
}

module.exports = ExportRushLogResponse