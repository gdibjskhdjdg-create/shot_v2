const TypeTool = require("../../../helper/type.tool");
const Validation = require("../../_default/validation");

class KeywordValidation extends Validation {
    constructor(){
        super();
    }

    createKeyword(data = {}){
        this.setEmpty();
        const { keyword, type, event = null, location = null } = data;

        if(!TypeTool.boolean(keyword)){
            this.setError("keyword is required");
        }
        else if(keyword.trim().length < 2){
            this.setError("keyword 2 min characters");
        }
        else{
            this.setValidData("keyword", keyword.trim());
        }

        if(!TypeTool.boolean(type)){
            this.setError("keyword type is required");
        }
        else if(!(["normal", "event", 'location"].includes(type))){
            this.setError("invalid keyword type");
        }
        else{
            this.setValidData("type", type);
        }

        if(type === "event"){
            let {
                day = null,
                month = null,
                year = null,
                type = null
            } = event;

            const validEventData = {};
            if(!TypeTool.isNullUndefined(day) && !TypeTool.isNullUndefined(month)){
                if(typeof day !== 'number'){
                    this.setError("day Must be Number")
                }
                if(typeof month !== 'number'){
                    this.setError("month Must Number")
                }
                if(!TypeTool.isNullUndefined(year) && typeof year !== 'number'){
                    year = null;
                }

                if(!['jalali', 'hijri', 'gregorian'].includes(type)){
                    this.setError("event keyword type is invalid")
                }
                
                validEventData.day = day;
                validEventData.month = month;
                validEventData.year = year;
                validEventData.type = type;
            }

            this.setValidData("event", validEventData);
        }

        this.setValidData("location", location);

        return this.getResult();
    }
}

module.exports = new KeywordValidation();