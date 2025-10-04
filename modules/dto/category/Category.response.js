const BaseResponse = require("../../_default/BaseResponse");


class CategoryResponse extends BaseResponse {

    constructor(data){
        super(data);

        this.id = this.setValue(["id", 'number']);
        this.name = this.setValue(["name", 'string']);
    }
}

module.exports = CategoryResponse;