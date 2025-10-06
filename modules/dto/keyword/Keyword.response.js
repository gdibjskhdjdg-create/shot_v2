const BaseResponse = require("../../_default/BaseResponse");


class KeywordResponse extends BaseResponse {

    constructor(data){
        super(data);

        this.id = this.setValue(["id"], 'number');
        this.keyword = this.setValue(["keyword"], 'string');
        this.type = this.setValue(["type"], 'string');
        this.count = this.setValue(["count"], 'number');
        this.keywords = this.setValue(["keywords"], "array")
        this.keywords = this.validate(["keywords"], "array")
    }
}

module.exports = KeywordResponse;