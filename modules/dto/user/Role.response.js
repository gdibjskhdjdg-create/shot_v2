const BaseResponse = require("../../_default/BaseResponse");


class RoleResponse extends BaseResponse {

    constructor(data) {
        super(data);

        this.id = this.setValue(["id", 'number']);
        this.name = this.setValue(["name", 'string']);
        this.access = data.access ? JSON.parse(data.access) : [];

    }}

module.exports = RoleResponse;