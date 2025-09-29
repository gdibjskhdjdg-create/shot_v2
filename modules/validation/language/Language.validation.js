const TypeTool = require("../../../helper/type.tool");
const Validation = require("../../_default/validation");

class LanguageValidation extends Validation {
    constructor() {
        super();
    }

    async create(data = {}) {
        return await this.languageValidation(data);
    }

    async update(id, data = {}) {
        return await this.languageValidation(data, id);
    }

    async languageValidation(data, id = 0){
        this.setEmpty()
        const { name = "" } = data;

        if(!TypeTool.boolean(name) || name.trim().length < 2){
            this.setError("name language is required");
        }
        else{
            this.setValidData("name", name)
        }

        return this.getResult();
    }
}

module.exports = new LanguageValidation();