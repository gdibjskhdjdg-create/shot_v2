const AsyncHandler = require("../../../helper/asyncHandler.tool");
const ErrorResult = require("../../../helper/error.tool");
const { shotService } = require("../../services/shotList");

module.exports = (status = []) => AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const shot = await shotService.getById(id);
    if (shot && status.includes(shot.status)) {
        // return next()
        return
    }

    throw ErrorResult.forbidden();
})