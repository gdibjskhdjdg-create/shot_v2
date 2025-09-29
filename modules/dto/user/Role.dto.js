const DTO = require("../../_default/DTO");


class RoleDTO extends DTO {

    constructor(data) {
        super(data);

        this.id = data.id
        this.name = this.validate(["name", 'string']);
        this.access = data.access ? JSON.parse(data.access) : [];

    }
}

module.exports = RoleDTO