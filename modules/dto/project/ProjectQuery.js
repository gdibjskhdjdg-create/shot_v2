const DTO = require("../../_default/DTO");


class ProjectQuery_DTO extends DTO {

    constructor(data){
        super(data);

        this.userId = this.validate(["userId", 'number']);
        this.page = this.validate(["page", 'number']);
        this.take = this.validate(["take", 'number']);
        this.search = this.validate(["search", 'string']);
        this.sortKey = data?.sortKey ?? "createdAt";
        this.sortACS = data?.sortACS ?? "DESC";
    }
}

module.exports = ProjectQuery_DTO