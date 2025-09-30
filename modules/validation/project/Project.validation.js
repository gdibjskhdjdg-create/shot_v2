const TypeTool = require("../../../helper/type.tool");
const Validation = require("../../_default/validation");

const validateProjectData = (data = {}) => {
    const validation = new Validation();
    const reqKey = ["title"];
    const optionalKey = ["titleEn", "code", "workTimeRatio", "equalizeRatio", "template", "structure", "type", "producer", "director", "duration", "productionYear"];

    validation.setEmpty();

    reqKey.forEach(item => {
        if (!TypeTool.boolean(data[item])) {
            validation.setError(`${item} is required`);
        }
        validation.setValidData(item, data[item]);
    });

    optionalKey.forEach(item => {
        if (!TypeTool.isNullUndefined(data[item])) {
            validation.setValidData(item, data[item]);
        }
    });

    return validation.getResult();
}

module.exports = {
    validateProjectData
};