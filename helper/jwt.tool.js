const jwt = require("jsonwebtoken");
const TypeTool = require("./type.tool");

// the input variable must be object in order for expiration time to work correctly
exports.generateAccessToken = (data, expiresIn = appConfigs.JWT_EXPIRATION_TIME) => {
    let options = {}
    if(TypeTool.boolean(expiresIn)){
        options = { expiresIn }
    }

    return jwt.sign(data, appConfigs.JWT_SECRET, options);
};

exports.decodeAccessToken = (token) => {
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, appConfigs.JWT_SECRET);
    } catch (err) {
        decodedToken = null;
    }

    return decodedToken;
};
