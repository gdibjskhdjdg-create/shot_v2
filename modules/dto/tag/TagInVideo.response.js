const BaseResponse = require("../../_default/BaseResponse");


class TagInVideoResponse extends BaseResponse {

    constructor(data){
        super(data);

        this.id = this.setValue(["id"], 'number');
        this.tag = this.setValue(["tag"], 'string');
        this.type = this.setValue(["type"], 'type');
        this.shotCount = this.setValue(["shotCount"], 'number');
        this.count = this.setValue(["count"], 'number');
    }
}

module.exports = TagInVideoResponse