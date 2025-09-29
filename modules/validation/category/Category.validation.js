const TypeTool = require("../../../helper/type.tool");
const Validation = require("../../_default/validation");

class CategoryValidation extends Validation {
    constructor() {
        super();
    }

    async create(data = {}) {
        return await this.categoryValidation(data);
    }

    async update(id, data = {}) {
        return await this.categoryValidation(data, id);
    }

    async categoryValidation(data){
        this.setEmpty()
        const { name = "" } = data;

        if(!TypeTool.boolean(name) || name.trim().length < 2){
            this.setError("name is required");
        }
        else{
            this.setValidData("name", name)
        }

        return this.getResult();
    }
}

module.exports = new CategoryValidation();