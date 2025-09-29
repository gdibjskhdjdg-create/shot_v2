const DTO = require("../../_default/DTO");
const UserInfoDTO = require("./UserInfo.dto");


class LoginDTO extends DTO {

    constructor(data){
        super(data);

        this.token = this.validate(['token'], 'string');
        this.user = UserInfoDTO.create(data.user);
    }
}

module.exports = LoginDTO;