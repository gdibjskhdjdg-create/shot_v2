const TypeTool = require("../../../helper/type.tool");
const Validation = require("../../_default/validation");

class OwnerValidation extends Validation {
    constructor() {
        super();
    }

    async create(data = {}) {
        return await this.ownerValidation(data);
    }

    async update(id, data = {}) {
        return await this.ownerValidation(data, id);
    }

    async ownerValidation(data){
        this.setEmpty()
        const { name = "" } = data;

        if(!TypeTool.boolean(name) || name.trim().length < 2){
            this.setError("min name is 2 characters");
        }
        else{
            this.setValidData("name", name)
        }

        return this.getResult();
    }
}

module.exports = new OwnerValidation();