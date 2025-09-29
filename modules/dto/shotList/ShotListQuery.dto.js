const DTO = require("../../_default/DTO");


class ShotListQuery_DTO extends DTO {

    constructor(data){
        super(data);

        this.id = this.validate(["id", 'number']);
        this.page = this.validate(["page", 'number']);
        this.take = this.validate(["take", 'number']);
        this.search = this.validate(["search", 'string']);
    }
}

module.exports = ShotListQuery_DTO