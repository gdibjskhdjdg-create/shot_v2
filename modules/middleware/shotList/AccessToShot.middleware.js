const AsyncHandler = require("../../../helper/asyncHandler.tool");
const ErrorResult = require("../../../helper/error.tool");
const { shotService } = require("../../services/shotList");

module.exports = AsyncHandler(async (req, res, next) => {
    const user = req.user;
    const { id } = req.params;

    if(user.permission !== 'admin' && !user.access.includes("shot-full-access")){
        const shot = await shotService.checkAccessToShot(id, user.id);
        if(!shot){
            throw ErrorResult.forbidden("شما درسترسی به این شات ندارید");
        }
    }

    // return next()
})