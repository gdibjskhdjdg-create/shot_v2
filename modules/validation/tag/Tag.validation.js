
const ErrorResult = require("../../../helper/error.tool");
const TypeTool = require("../../../helper/type.tool");

const validateNewTag = (data = {}) => {
    const errors = [];
    const validData = {};
    const { tag, type, event = null, location = null } = data;

    if(!TypeTool.boolean(tag)){
        errors.push("tag is required");
    }
    else if(tag.trim().length < 2){
        errors.push("tag 2 min characters");
    }
    else{
        validData.tag = tag.trim();
    }

    if(!TypeTool.boolean(type)){
        errors.push("tag type is required");
    }
    else if(!(["normal", "event", "location"].includes(type))){
        errors.push("invalid tag type");
    }
    else{
        validData.type = type;
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
                errors.push("day Must be Number");
            }
            if(typeof month !== 'number'){
                errors.push("month Must Number");
            }
            if(!TypeTool.isNullUndefined(year) && typeof year !== 'number'){
                year = null;
            }

            if(!['jalali', 'hijri', 'gregorian'].includes(type)){
                errors.push("event tag type is invalid");
            }
            
            validEventData.day = day;
            validEventData.month = month;
            validEventData.year = year;
            validEventData.type = type;
        }

        validData.event = validEventData;
    }

    validData.location = location;

    if (errors.length > 0) {
        throw ErrorResult.badRequest(errors.join(', '));
    }

    return validData;
}

module.exports = {
    createTag: validateNewTag
};
