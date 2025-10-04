const BaseResponse = require("../../_default/BaseResponse");


class TagResponse extends BaseResponse {

    constructor(data){
        super(data);

        this.id = this.setValue(["id"], 'number');
        this.tag = this.setValue(["tag"], 'string');
        this.type = this.setValue(["type"], 'string');
        this.count = this.setValue(["count"], 'number');
        this.tags = this.setValue(["tags"], "array")
        this.tags = this.validate(["tags"], "array")
    }
}

module.exports = TagResponse;