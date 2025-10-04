const BaseResponse = require("../../_default/BaseResponse");


class LanguageResponse extends BaseResponse {

    constructor(data){
        super(data);

        this.id = this.setValue(["id", 'number']);
        this.name = this.setValue(["name", 'string']);
    }
}

module.exports = LanguageResponse;