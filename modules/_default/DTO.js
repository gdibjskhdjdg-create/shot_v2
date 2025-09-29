const jalaliMoment = require("jalali-moment");
/* ---------------------------------- Tools --------------------------------- */
const { createServerUrl } = require("../../helper/general.tool");
const TypeTool = require("../../helper/type.tool");

class DTO {
    #data = {};
    constructor(data) {
        this.updateDTOData(data === null ? {} : data);
    }

    mongoIdToString(key){
        if(this.#data && this.#data.hasOwnProperty(key)){
            if(Array.isArray(this.#data[key])){
                return this.#data[key].map(item => item.toString());
            }
            else{
                return this.#data[key]?.toString()
            }
        }
        else{
            return ""
        }
    }

    validate(keys, type) {
        let lastValue = "";
        keys = TypeTool.array(keys);

        for (let i = 0; i < keys.length; i++) {
            if (
                typeof this.#data === "object" &&
                this.#data.hasOwnProperty(keys[i])
            ) {
                lastValue = this.#data[keys[i]];
                break;
            } else {
                continue;
            }
        }

        if (type === "string") {
            lastValue = TypeTool.string(lastValue);
        } else if (type === "number") {
            lastValue = TypeTool.number(lastValue);
        } else if (type === "boolean") {
            lastValue = TypeTool.boolean(lastValue);
        } else if (type === "array") {
            lastValue = TypeTool.array(lastValue).filter(
                (item) => !TypeTool.isEmpty(item)
            );
        } else if (type === "url") {
            lastValue = TypeTool.boolean(lastValue)
                ? createServerUrl(TypeTool.string(lastValue))
                : "";
        } else if (type === "object") {
            lastValue = TypeTool.boolean(lastValue) ? lastValue : {};
        } else if (type === "date") {
            lastValue = jalaliMoment(lastValue)
            if(lastValue.isValid()){
                lastValue = lastValue.locale("fa").format("YYYY/MM/DD HH:mm")
            }
            else{
                lastValue = "";
            }
        }

        return lastValue;
    }

    updateDTOData(data) {
        this.#data = this.checkToJSON(data);
    }

    checkToJSON(data) {
        if (data?.toJSON) {
            data = data.toJSON();
        }

        return data;
    }

    static create(data, defaultValue) {
        let isArray = true;
        if (!Array.isArray(data)) {
            data = [data];
            isArray = false;
        }

        data = data.map((item) => {
            if (item instanceof this) {
                return item;
            } else {
                if(typeof item !== 'object') item = {};
                if(!TypeTool.boolean(item) && defaultValue !== undefined){
                    return defaultValue;
                }
                else{
                    return new this(item);
                }
            }
        });

        if (!isArray) data = data[0];

        return data;
    }
}

module.exports = DTO;
