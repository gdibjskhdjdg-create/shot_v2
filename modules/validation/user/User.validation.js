const TypeTool = require("../../../helper/type.tool");
const Validation = require("../../_default/validation");
const UserService = require("../../services/user/User.service");

const passwordValidation = (validation, password) => {
    if (!TypeTool.isnotEmpty(password)) {
        validation.setError("password is required");
    } else if (password.length < 8) {
        validation.setError("min password is 8 characters");
    }
};

const createUserValidation = async (data = {}) => {
    const {
        phone, firstName, lastName, password
    } = data;

    const validation = new Validation();

    if (!TypeTool.isnotEmpty(phone)) {
        validation.setError("phone is required");
    } else {
        const checkPhoneDupPhone = await UserService.findUserByPhone(phone);
        if (checkPhoneDupPhone) {
            validation.setError("phone is Duplicate");
        }
        validation.setValidData("phone", phone);
    }

    if (!TypeTool.isnotEmpty(firstName)) {
        validation.setError("firstName is Required");
    } else {
        validation.setValidData("firstName", firstName);
    }

    if (!TypeTool.isnotEmpty(lastName)) {
        validation.setError("lastName is required");
    } else {
        validation.setValidData("lastName", lastName);
    }

    validation.setValidData("permission", "user");

    passwordValidation(validation, password);
    validation.setValidData("password", password);

    return validation.getResult();
};

const updateUserInfoValidation = (data = {}) => {
    const {
        firstName, lastName, permission
    } = data;

    const validation = new Validation();

    if (!TypeTool.isnotEmpty(firstName)) {
        validation.setError("firstName is Required ");
    } else {
        validation.setValidData("firstName", firstName);
    }

    if (!TypeTool.isnotEmpty(lastName)) {
        validation.setError("lastName is required");
    } else {
        validation.setValidData("lastName", lastName);
    }

    if (permission !== undefined) {
        validation.setValidData("permission", "user");
    }

    return validation.getResult();
};

const changePasswordValidation = (data = {}) => {
    const {
        password
    } = data;

    const validation = new Validation();
    passwordValidation(validation, password);
    validation.setValidData("password", password);

    return validation.getResult();
};

module.exports = {
    createUserValidation,
    updateUserInfoValidation,
    changePasswordValidation
};