const TypeTool = require("../../../helper/type.tool");
const Validation = require("../../_default/validation");

class TagCategoryValidation extends Validation {
    constructor(){
        super();
    }

    createTagCategory(data = {}){
        this.setEmpty()

        const {
            name, tagIds = []
        } = data;

        if(!TypeTool.boolean(name)){
            this.setError("name is required");
        }
        else if(name.trim().length < 2){
            this.setError("min tag name is 2 characters");
        }
        else{
            this.setValidData("name", name.trim());
        }

        if(!Array.isArray(tagIds)){
            this.setError("tagIds must be an array")
        }

        this.setValidData("tagIds", tagIds.filter(item => item))

        return this.getResult();
    }
}

module.exports = new TagCategoryValidation();