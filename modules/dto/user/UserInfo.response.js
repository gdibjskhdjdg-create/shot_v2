const BaseResponse = require("../../_default/BaseResponse");


class UserInfoResponse extends BaseResponse {

    constructor(data){
        super(data);

        this.firstName = this.setValue(["firstName", 'string']);
        this.lastName = this.setValue(["lastName", 'string']);
        this.fullName = this.setValue(["fullName", 'string']);
        this.phone = this.setValue(["phone", 'string']);
        this.permission = this.setValue(["permission", 'string']);
        this.createdAt = this.setValue(["createdAt", 'string']);
        this.access = data.access;
    }
}

module.exports = UserInfoResponse;