const BaseResponse = require("../../_default/BaseResponse");


class ShotListQuery extends BaseResponse {

    constructor(data){
        super(data);

        this.videoFileId = this.setValue(["videoFileId", 'number']);
        this.page = this.setValue(["page", 'number']);
        this.take = this.setValue(["take", 'number']);
        this.search = this.setValue(["search", 'string']);
    }
}

module.exports = ShotListQuery