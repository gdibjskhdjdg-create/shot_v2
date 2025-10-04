const jalaliMoment = require("jalali-moment");
/* ---------------------------------- Tools --------------------------------- */
const { createServerUrl } = require("../../helper/general.tool");
const TypeTool = require("../../helper/type.tool");

class BaseResponse {
    #data = {};
    constructor(data) {
        this.updateDTOData(data === null ? {} : data);
    }

    setValue(keys, type) {
        keys = TypeTool.array(keys);

        // پیدا کردن مقدار با استفاده از find
        const foundKey = keys.find(key => 
            typeof this.#data === "object" && 
            this.#data?.hasOwnProperty?.(key)
        );
        let lastValue = foundKey ? this.#data[foundKey] : "";
        
        // تبدیل نوع
        const typeMap = {
            string: v => TypeTool.string(v),
            number: v => TypeTool.number(v),
            boolean: v => TypeTool.boolean(v),
            array: v => TypeTool.array(v).filter(item => !TypeTool.isEmpty(item)),
            url: v => TypeTool.boolean(v) ? createServerUrl(TypeTool.string(v)) : "",
            object: v => TypeTool.boolean(v) ? v : {},
            date: v => {
                const date = jalaliMoment(v);
                return date?.isValid?.() ? date.locale("fa").format("YYYY/MM/DD HH:mm") : "";
            }
        };
        
        return typeMap[type] ? typeMap[type](lastValue) : lastValue;
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

module.exports = BaseResponse;
