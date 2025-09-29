const DTO = require("../../_default/DTO");


class TagInVideo_DTO extends DTO {

    constructor(data){
        super(data);

        this.id = this.validate(["id"], 'number');
        this.tag = this.validate(["tag"], 'string');
        this.type = this.validate(["type"], 'type');
        this.shotCount = this.validate(["shotCount"], 'number');
        this.count = this.validate(["count"], 'number');
    }
}

module.exports = TagInVideo_DTO