const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const ErrorResult = require("../../../helper/error.tool");
const AuthService = require("../../services/user/Auth.service");



module.exports = ErrorBoundary(async (req, reply) => {
    let user = null;
    let token = null;
    if(req.headers.authorization){
        token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
        user = await AuthService.getUserInfoFromToken(token);
    }

    req.user = user;
    req.token = token;

    // return next()
})