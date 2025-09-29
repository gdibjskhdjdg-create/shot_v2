const DTO = require("../../_default/DTO");


class Owner_DTO extends DTO {

    constructor(data){
        super(data);

        this.id = this.validate(["id", 'number']);
        this.name = this.validate(["name", 'string']);
    }
}

module.exports = Owner_DTO