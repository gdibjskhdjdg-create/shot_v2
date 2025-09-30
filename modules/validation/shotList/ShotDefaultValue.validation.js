const TypeTool = require("../../../helper/type.tool");
const Validation = require("../../_default/validation");

const validateShotDefaultValue = async (data = {}) => {
    const validation = new Validation();
    const { section = "", value = "", key = "" } = data;

    if (!TypeTool.boolean(section) || section.trim().length < 2) {
        validation.setError("section is required");
    } else {
        validation.setValidData("section", section);
    }

    if (!TypeTool.boolean(value) || value.trim().length < 2) {
        validation.setError("value is required");
    } else {
        validation.setValidData("value", value);
    }

    if (!TypeTool.boolean(key) || key.trim().length < 2) {
        validation.setError("key is required");
    } else {
        validation.setValidData("key", key);
    }

    return validation.getResult();
};

module.exports = {
    create: validateShotDefaultValue,
    update: validateShotDefaultValue,
};