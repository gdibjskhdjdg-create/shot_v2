const bcrypt = require("bcrypt");


class PasswordService {

    async generatePassword(password){
        return await bcrypt.hash(password, bcrypt.genSaltSync(10));
    }

    comparePassword(password, userPassword){
        return bcrypt.compareSync(password, userPassword);
    }

}

module.exports = new PasswordService()