const ErrorResult = require("../../helper/error.tool");
const generalTool = require("../../helper/general.tool");

class ResponseDTO {
    static success(res, result = {}, statusCode = 200) {
        return res.code(statusCode).send({
            result,
            status: 200
        });
    }

    static error(res, err, statusCode = 400, name) {
        if (err instanceof ErrorResult) {
            statusCode = err.statusCode;
            name = err.name;
            err = err.message;
        }

        return res
            .code(statusCode)
            .send(generalTool.errorResponse(err, name, statusCode));
    }
}

module.exports = ResponseDTO;
