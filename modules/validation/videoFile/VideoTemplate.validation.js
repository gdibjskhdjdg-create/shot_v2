const TypeTool = require("../../../helper/type.tool");
const ErrorResult = require("../../../helper/error.tool");

// A helper function to process validation logic, removing the need for a base class.
const processValidation = (data, validationLogic) => {
    const errors = [];
    const validData = {};

    const setError = (message) => errors.push(message);
    const setValidData = (key, value) => {
        // Ensure undefined values are not set in the clean data object.
        if (value !== undefined && value !== null) {
            validData[key] = value;
        }
    };

    // Execute the specific validation rules for the function.
    validationLogic(data, setValidData, setError);

    // If any errors were collected, throw a structured error.
    if (errors.length > 0) {
        throw ErrorResult.badRequest(null, errors);
    }
    
    // Otherwise, return the sanitized and validated data.
    return validData;
};

const validateCreateTemplate = (data = {}) => {
    return processValidation(data, (rawData, setValidData, setError) => {
        const {
            quality = '480',
            isMute = 'false',
            bitrate,
            gifTime,
            title,
            logo,
            text,
        } = rawData;

        if (title?.value && title.value.length >= 3) {
            setValidData("title", title.value);
        } else {
            setError("Title is required and must be at least 3 characters long.");
        }

        setValidData("quality", quality?.value);
        setValidData("isMute", isMute?.value);
        setValidData("bitrate", bitrate?.value);
        setValidData("gifTime", gifTime?.value);
        
        try {
            if (logo?.value) setValidData("logo", JSON.parse(logo.value));
            if (text?.value) setValidData("text", JSON.parse(text.value));
        } catch (e) {
            setError("Invalid JSON format for 'logo' or 'text' parameters.");
        }
    });
};

const validateUpdateTemplate = (data = {}) => {
    return processValidation(data, (rawData, setValidData, setError) => {
        const { title, quality, isMute, bitrate, logo, text, gifTime } = rawData;

        if (title?.value) {
            if (title.value.length < 3) {
                setError("Title must be at least 3 characters long.");
            } else {
                setValidData("title", title.value);
            }
        }

        if (quality?.value) setValidData("quality", +quality.value);
        if (gifTime?.value) setValidData("gifTime", gifTime.value);
        if (bitrate?.value) setValidData("bitrate", bitrate.value);

        if (!TypeTool.isNullUndefined(isMute?.value)) {
            setValidData("isMute", isMute.value);
        }
        
        try {
            if (logo?.value) setValidData("logo", JSON.parse(logo.value));
            if (text?.value) setValidData("text", JSON.parse(text.value));
        } catch (e) {
            setError("Invalid JSON format for 'logo' or 'text' parameters.");
        }
    });
};

module.exports = {
    createTemplate: validateCreateTemplate,
    updateTemplate: validateUpdateTemplate,
};