const TypeTool = require("../../../helper/type.tool");
const DTO = require("../../_default/DTO");


class VideoFileListQuery_DTO extends DTO {

    constructor(data){
        super(data);

        this.hasShot = (!TypeTool.isNullUndefined(data.hasShot) && typeof data.hasShot === 'boolean') ? data.hasShot : null;
        this.page = this.validate(["page"], 'number');
        this.take = this.validate(["take"], 'number');
        this.title = this.validate(["title"], 'string');
        this.originalName = this.validate(["originalName"], 'string');
        this.shotStatus = this.validate(["shotStatus"], 'strings');
        this.status = this.validate(["status"], 'string');
        this.projectId = this.validate(["projectId"], 'number');
        this.userId = this.validate(["userId"], 'number');
        this.userId = this.validate(["userId"], 'string');
        this.sortKey = this.validate(["sortKey"], 'string');
        this.sortACS = this.validate(["sortACS"], 'string');
    }
}

module.exports = VideoFileListQuery_DTO