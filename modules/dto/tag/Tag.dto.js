const DTO = require("../../_default/DTO");


class Tag_DTO extends DTO {

    constructor(data){
        super(data);

        this.id = this.validate(["id"], 'number');
        this.tag = this.validate(["tag"], 'string');
        this.type = this.validate(["type"], 'string');
        this.count = this.validate(["count"], 'number');
        this.tags = this.validate(["tags"], "array")
    }
}

module.exports = Tag_DTO