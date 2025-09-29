const TypeTool = require("../../../helper/type.tool");
const Validation = require("../../_default/validation");
const UserService = require("../../services/user/User.service");



class UserValidation extends Validation {
    constructor() {
        super();
    }

    async createUser(data = {}) {
        const {
            phone, firstName, lastName, password, permission = "user"
        } = data;

        this.setEmpty()

        if (!TypeTool.boolean(phone)) {
            this.setError("phone is required")
        }
        else {
            const checkPhoneDupPhone = await UserService.findByPhone(phone);
            if (checkPhoneDupPhone) {
                this.setError("phone is Duplicate");
            }

            this.setValidData("phone", phone);
        }

        if (!TypeTool.boolean(firstName)) {
            this.setError("firstName is Required");
        }
        else {
            this.setValidData("firstName", firstName);
        }

        if (!TypeTool.boolean(lastName)) {
            this.setError("lastName is required");
        }
        else {
            this.setValidData("lastName", lastName);
        }

        this.setValidData("permission", "user");

        this.passwordValidation(password);
        this.setValidData("password", password);

        return this.getResult();
    }

    async updateUserInfo(data = {}) {
        const {
            firstName, lastName, permission
        } = data;

        this.setEmpty()

        if (!TypeTool.boolean(firstName)) {
            this.setError("firstName is Required ")
        }
        else {
            this.setValidData("firstName", firstName)
        }

        if (!TypeTool.boolean(lastName)) {
            this.setError("lastName is required")
        }
        else {
            this.setValidData("lastName", lastName)
        }

        if (!TypeTool.isNullUndefined(permission)) {
            this.setValidData("permission", "user");
        }

        return this.getResult();
    }

    changePassword(data = {}) {
        const {
            password
        } = data;

        this.passwordValidation(password);
        this.setValidData("password", password);

        return this.getResult();
    }

    passwordValidation(password) {
        if (!TypeTool.boolean(password)) {
            this.setError("password is required")
        }
        else if (password.length < 8) {
            this.setError("min password is 8 characters")
        }
    }
}

module.exports = new UserValidation();