const DTO = require("../../_default/DTO");


class UserInfoDTO extends DTO {

    constructor(data){
        super(data);

        this.firstName = this.validate(["firstName", 'string']);
        this.lastName = this.validate(["lastName", 'string']);
        this.fullName = this.validate(["fullName", 'string']);
        this.phone = this.validate(["phone", 'string']);
        this.permission = this.validate(["permission", 'string']);
        this.createdAt = this.validate(["createdAt", 'string']);
        this.access = data.access
    }
}

module.exports = UserInfoDTO