const TypeTool = require("../../../helper/type.tool");
const Validation = require("../../_default/validation");

class KeywordCategoryValidation extends Validation {
    constructor(){
        super();
    }

    createKeywordCategory(data = {}){
        this.setEmpty()

        const {
            name, keywordIds = []
        } = data;

        if(!TypeTool.boolean(name)){
            this.setError("name is required");
        }
        else if(name.trim().length < 2){
            this.setError("min keyword name is 2 characters");
        }
        else{
            this.setValidData("name", name.trim());
        }

        if(!Array.isArray(keywordIds)){
            this.setError("keywordIds must be an array")
        }

        this.setValidData("keywordIds", keywordIds.filter(item => item))

        return this.getResult();
    }
}

module.exports = new KeywordCategoryValidation();