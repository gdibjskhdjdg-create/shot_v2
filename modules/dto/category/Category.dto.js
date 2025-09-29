const DTO = require("../../_default/DTO");


class Category_DTO extends DTO {

    constructor(data){
        super(data);

        this.id = this.validate(["id", 'number']);
        this.name = this.validate(["name", 'string']);
    }
}

module.exports = Category_DTO