/* ---------------------------------- Tools --------------------------------- */
const { logError } = require("./log.tool");

const ErrorResult = class {
    constructor(name = "API Error", statusCode = 500, message, code) {
        this.message = message;
        this.name = name;
        this.statusCode = statusCode;
        this.messageCode = code;
    }

    static result(name, statusCode, err, code) {
        if (err instanceof ErrorResult) {
            return err;
        } else {
            return new ErrorResult(name, statusCode, err, code);
        }
    }

    static badRequest(message = "", code = null, force = true) {
        // if(!force && appConfigs.NODE_ENV !== 'development'){
        //     message = "bad request";
        // }
        return ErrorResult.result("BAD_REQUEST", 400, message, code);
    }

    static unAuthorized(message = "", code = null) {
        return ErrorResult.result("UNAUTHORIZED", 401, message, code);
    }

    static forbidden(message = "", code = null) {
        return ErrorResult.result("FORBIDDEN", 403, message, code);
    }

    static notFound(message = "", code = null) {
        return ErrorResult.result("NOT_FOUND", 404, message, code);
    }
    static conflict(message = "", code = null) {
        return ErrorResult.result("Conflict", 409, message, code);
    }

    static internal(err, code = null, section = "") {
        if (!(err instanceof ErrorResult)) {
            if (!(err instanceof Error)) {
                err = new Error(err);
            }

            logError(section, err);

            if(appConfigs.NODE_ENV !== "development"){
                err = "Error";
                code = null;
            }
        }

        return ErrorResult.result("INTERNAL_SERVER_ERROR", 500, err, code);
    }

    /** NOT RECEIVING PROPER ANSWER FROM UPPER SERVER */
    static badGateway(message = "", code = null) {
        return ErrorResult.result("BAD_GATEWAY", 502, message, code);
    }

    /** ORVERLOADED SERVICE OR UNDER MAINTENANCE */
    static unAvailabe(message = "", code = null) {
        return ErrorResult.result("SERVICE_UNAVAILABLE", 503, message, code);
    }

    /** LIKE BAD_GATEWAY WICH IS NOT RECIEVING RESPONSE IN ALLOWED TIME */
    static gatewayTimeout(message = "", code = null) {
        return ErrorResult.result("SERVICE_UNAVAILABLE", 504, message, code);
    }
};

module.exports = ErrorResult;
