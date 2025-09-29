const AsyncHandler = require("../../../helper/asyncHandler.tool");
const ErrorResult = require("../../../helper/error.tool");
const RoleService = require("../../services/user/Role.service");


module.exports = (access = []) => {

    return AsyncHandler(async (req,  reply) => {
        const user = req.user;

        if (!user) {
            throw ErrorResult.unAuthorized();
        }

        if (user.permission == 'admin') {
            // return next()
            return
        }

        const userAccess = await RoleService.getUserAccessList(user)
        req.user.access = userAccess;
        if(access.length === 0){
            // return next()
            return
        }

        const valid = access.some(acs => userAccess.includes(acs));

        if (!valid || userAccess.length == 0) {
            throw ErrorResult.forbidden();
        } else {
             // return next()
            //  return
        }
    })
}