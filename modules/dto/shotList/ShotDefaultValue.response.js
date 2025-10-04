const BaseResponse = require("../../_default/BaseResponse");


class ShotDefaultValueResponse extends BaseResponse {

    constructor(data){
        super(data);

        this.id = this.setValue(["id", 'number']);
        this.section = this.setValue(["section", 'string']);
        this.value = this.setValue(["value", 'string']);
        this.key = this.setValue(["key", 'string']);
    }
}

module.exports = ShotDefaultValueResponse;