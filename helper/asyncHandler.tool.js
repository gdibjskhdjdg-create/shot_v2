const TypeTool = require("./type.tool");
const ErrorResult = require("./error.tool");
const { ValidationError } = require("sequelize");
const ResponseDTO = require("../modules/_default/Response.dto");

function AsyncHandler(fn) {
    return async function (request, reply) {
        try {
            await fn(request, reply);
        }
        catch (err) {
            let functionName = "asyncHandler";
            if (typeof fn === "function") {
                functionName = fn.name;
            }

            if (
                !TypeTool.boolean(err?.message) &&
                TypeTool.boolean(err?.messageCode)
            ) {
                err.message = ErrorResult.internal("some thing is wrong", err.messageCode)
            }
            else if (err instanceof ValidationError) {
                err = ErrorResult.badRequest(err.errors.map(item => item.message));
            }

            return ResponseDTO.error(
                reply,
                ErrorResult.internal(err, null, functionName)
            );
        }
    };

}


module.exports = AsyncHandler;