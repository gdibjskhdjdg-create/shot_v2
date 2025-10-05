const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const ErrorResult = require("../../../helper/error.tool");

module.exports = (role = []) => {
    return ErrorBoundary((req, reply) => {
        const user = req.user;
        if(!user){
            throw ErrorResult.unAuthorized();
        }
    
        if(user.permission !== "admin" && role.length !== 0 && !role.includes(user.permission)){
            throw ErrorResult.forbidden();
        }
        
        // return next()
    })
}