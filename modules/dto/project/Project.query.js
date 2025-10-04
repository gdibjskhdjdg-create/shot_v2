const BaseResponse = require("../../_default/BaseResponse");


class ProjectQuery extends BaseResponse {

    constructor(data) {
        super(data);

        this.userId = this.setValue(["userId", 'number']);
        this.page = this.setValue(["page", 'number']);
        this.take = this.setValue(["take", 'number']);
        this.search = this.setValue(["search", 'string']);
        this.sortKey = data?.sortKey ?? "createdAt";
        this.sortACS = data?.sortACS ?? "DESC";
    }
}

module.exports = ProjectQuery;