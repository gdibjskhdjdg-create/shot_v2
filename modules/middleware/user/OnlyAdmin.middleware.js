const AsyncHandler = require("../../../helper/asyncHandler.tool");
const ErrorResult = require("../../../helper/error.tool");



module.exports = AsyncHandler((req, reply) => {
    const user = req.user;
    if(!user){
        throw ErrorResult.unAuthorized("ابتدا وارد شوید");
    }
    if(user.permission !== 'admin'){
        throw ErrorResult.forbidden('عدم دسترسی')
    }

    // return next()
})