const AsyncHandler = require("../../../helper/asyncHandler.tool");
const ErrorResult = require("../../../helper/error.tool");

module.exports = (role = []) => {
    return AsyncHandler((req, reply) => {
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