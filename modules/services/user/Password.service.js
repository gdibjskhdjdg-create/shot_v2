const bcrypt = require("bcrypt");

const generatePassword = async (password) => {
    return await bcrypt.hash(password, bcrypt.genSaltSync(10));
}

const comparePassword = (password, userPassword) => {
    return bcrypt.compareSync(password, userPassword);
}

module.exports = {
    generatePassword,
    comparePassword
};