const DTO = require("../../_default/DTO");
const moment = require("jalali-moment");

class Project_DTO extends DTO {

    constructor(data){
        super(data);

        this.id = this.validate(["id", 'number']);
        this.title = this.validate(["title", 'string']);
        this.shotStatus = this.validate(["shotStatus", "string"])
        this.titleEn = this.validate(["titleEn", 'string']);
        this.code = this.validate(["code", 'string']);
        this.template = this.validate(["template", 'string']);
        this.structure = this.validate(["structure", 'string']);
        this.type = this.validate(["type", 'string']);
        this.producer = this.validate(["producer", 'string']);
        this.director = this.validate(["director", 'string']);
        this.duration = this.validate(["duration", 'number']);
        this.workTimeRatio = this.validate(["workTimeRatio", 'number']);
        this.equalizeRatio = this.validate(["equalizeRatio", 'number']);
        this.productionYear = this.validate(["productionYear", 'number']);
        this.createdAt = moment(data.createdAt).format("jYYYY/jMM/jDD");
    }
}

module.exports = Project_DTO