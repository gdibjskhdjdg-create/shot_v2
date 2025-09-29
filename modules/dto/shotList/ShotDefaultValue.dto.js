const DTO = require("../../_default/DTO");


class ShotDefaultValue_DTO extends DTO {

    constructor(data){
        super(data);

        this.id = this.validate(["id", 'number']);
        this.section = this.validate(["section", 'string']);
        this.value = this.validate(["value", 'string']);
        this.key = this.validate(["key", 'string']);
    }
}

module.exports = ShotDefaultValue_DTO