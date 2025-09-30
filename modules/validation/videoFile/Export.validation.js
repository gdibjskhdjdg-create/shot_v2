const Validation = require("../../_default/validation");

const validateCreateRush = async (body) => {
    const validation = new Validation();
    const { fileId } = body;
    if (!fileId) {
        validation.setError('fileId is required');
    }

    if(validation.isError) {
        return validation.getResult();
    }
    
    validation.setValidData('fileId', fileId);

    return validation.getResult();
}

module.exports = {
    createRush: validateCreateRush
};