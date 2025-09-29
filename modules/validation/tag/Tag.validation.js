const TypeTool = require("../../../helper/type.tool");
const Validation = require("../../_default/validation");

class TagValidation extends Validation {
    constructor(){
        super();
    }

    createTag(data = {}){
        this.setEmpty();
        const { tag, type, event = null, location = null } = data;

        if(!TypeTool.boolean(tag)){
            this.setError("tag is required");
        }
        else if(tag.trim().length < 2){
            this.setError("tag 2 min characters");
        }
        else{
            this.setValidData("tag", tag.trim());
        }

        if(!TypeTool.boolean(type)){
            this.setError("tag type is required");
        }
        else if(!(["normal", "event", "location"].includes(type))){
            this.setError("invalid tag type");
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
                    this.setError("event tag type is invalid")
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

module.exports = new TagValidation();