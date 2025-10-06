const BaseResponse = require("../../_default/BaseResponse");


class KeywordInVideoResponse extends BaseResponse {

    constructor(data){
        super(data);

        this.id = this.setValue(["id"], 'number');
        this.keyword = this.setValue(["keyword"], 'string');
        this.type = this.setValue(["type"], 'type');
        this.shotCount = this.setValue(["shotCount"], 'number');
        this.count = this.setValue(["count"], 'number');
    }
}

module.exports = KeywordInVideoResponse