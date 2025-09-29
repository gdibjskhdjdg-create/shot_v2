const DTO = require("../../_default/DTO");


class UserList_DTO extends DTO {

    constructor(data) {
        super(data);

        this.id = this.validate(["id", 'string']);
        this.firstName = this.validate(["firstName", 'string']);
        this.lastName = this.validate(["lastName", 'string']);
        this.fullName = this.validate(["fullName", 'string']);
        this.phone = this.validate(["phone", 'string']);
        this.permission = this.validate(["permission", 'string']);
        this.isActive = data.isActive > 0 //this.validate(["isActive", 'boolean']);
        this.createdAt = this.validate(["createdAt", 'string']);
        this.roles = data.role.map(item => { return { id: item.id, name: item.name } })
    }
}

module.exports = UserList_DTO