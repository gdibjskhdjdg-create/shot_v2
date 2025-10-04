const BaseResponse = require("../../_default/BaseResponse");
const UserInfoResponse = require("./UserInfo.response");


class LoginResponse extends BaseResponse {

    constructor(data){
        super(data);

        this.token = this.setValue(['token'], 'string');
        this.user = UserInfoResponse.create(data.user);
    }
}

module.exports = LoginResponse;