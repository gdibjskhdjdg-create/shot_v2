const BaseResponse = require("../../_default/BaseResponse");
const moment = require("jalali-moment");

class ProjectResponse extends BaseResponse {

    constructor(data){
        super(data);

        this.id = this.setValue(["id", 'number']);
        this.title = this.setValue(["title", 'string']);
        this.shotStatus = this.setValue(["shotStatus", "string"])
        this.titleEn = this.setValue(["titleEn", 'string']);
        this.code = this.setValue(["code", 'string']);
        this.template = this.setValue(["template", 'string']);
        this.structure = this.setValue(["structure", 'string']);
        this.type = this.setValue(["type", 'string']);
        this.producer = this.setValue(["producer", 'string']);
        this.director = this.setValue(["director", 'string']);
        this.duration = this.setValue(["duration", 'number']);
        this.workTimeRatio = this.setValue(["workTimeRatio", 'number']);
        this.equalizeRatio = this.setValue(["equalizeRatio", 'number']);
        this.productionYear = this.setValue(["productionYear", 'number']);
        this.createdAt = moment(data.createdAt).format("jYYYY/jMM/jDD");
    }
}

module.exports = ProjectResponse;