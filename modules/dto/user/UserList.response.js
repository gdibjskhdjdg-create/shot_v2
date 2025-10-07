const BaseResponse = require("../../_default/BaseResponse");


class UserListResponse extends BaseResponse {

    constructor(data) {
        super(data);

        this.id = this.setValue(["id", 'string']);
        this.firstName = this.setValue(["firstName", 'string']);
        this.lastName = this.setValue(["lastName", 'string']);
        this.fullName = this.setValue(["fullName", 'string']);
        this.phone = this.setValue(["phone", 'string']);
        this.permission = this.setValue(["permission", 'string']);
        this.isActive = data.isActive > 0 //this.validate(["isActive", 'boolean']);
        this.createdAt = this.setValue(["createdAt", 'string']);
        this.roles = data.role.map(item => { return { id: item.id, name: item.name } })
    }
}

module.exports = UserListResponse