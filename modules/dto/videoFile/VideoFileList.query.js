const TypeTool = require("../../../helper/type.tool");
const BaseResponse = require("../../_default/BaseResponse");


class VideoFileListQuery extends BaseResponse {

    constructor(data){
        super(data);

        this.hasShot = (!TypeTool.isNullUndefined(data.hasShot) && typeof data.hasShot === 'boolean') ? data.hasShot : null;
        this.page = this.setValue(["page"], 'number');
        this.take = this.setValue(["take"], 'number');
        this.title = this.setValue(["title"], 'string');
        this.originalName = this.setValue(["originalName"], 'string');
        this.shotStatus = this.setValue(["shotStatus"], 'strings');
        this.status = this.setValue(["status"], 'string');
        this.projectId = this.setValue(["projectId"], 'number');
        this.userId = this.setValue(["userId"], 'number');
        this.userId = this.setValue(["userId"], 'string');
        this.sortKey = this.setValue(["sortKey"], 'string');
        this.sortACS = this.setValue(["sortACS"], 'string');
    }
}

module.exports = VideoFileListQuery