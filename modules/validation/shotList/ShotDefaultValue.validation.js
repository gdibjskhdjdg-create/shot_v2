const TypeTool = require("../../../helper/type.tool");
const Validation = require("../../_default/validation");

class ShotDefaultValueValidation extends Validation {
    constructor() {
        super();
    }

    async create(data = {}) {
        return await this.shotDefaultValueValidation(data);
    }

    async update(id, data = {}) {
        return await this.shotDefaultValueValidation(data, id);
    }

    async shotDefaultValueValidation(data){
        this.setEmpty();
        const { section = "", value = "", key = "" } = data;

        if(!TypeTool.boolean(section) || section.trim().length < 2){
            this.setError("section is required");
        }
        else{
            this.setValidData("section", section)
        }

        if(!TypeTool.boolean(value) || value.trim().length < 2){
            this.setError("value is required");
        }
        else{
            this.setValidData("value", value)
        }

        if(!TypeTool.boolean(key) || key.trim().length < 2){
            this.setError("key is required");
        }
        else{
            this.setValidData("key", key)
        }

        return this.getResult();
    }
}

module.exports = new ShotDefaultValueValidation();