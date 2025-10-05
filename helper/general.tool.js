/* ---------------------------------- core ---------------------------------- */
const fs = require("fs");

/* -------------------------------- Packages -------------------------------- */
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const DeviceDetector = require("node-device-detector");
const deviceDetector = new DeviceDetector();
/* ---------------------------------- Tools --------------------------------- */
const ErrorResult = require("./error.tool");
const TypeTool = require("./type.tool");
// const { logError } = require("./log.tool");

exports.imageToBase64 = (filePath) => {
    try {
        // Read the image file as a binary data buffer
        const imageBuffer = fs.readFileSync(filePath);

        // Convert the buffer to a Base64-encoded string
        const base64String = imageBuffer.toString('base64');

        return base64String;
    } catch (error) {
        console.error('Error converting image to Base64:', error);
        return null;
    }
}

exports.secondToTimeFormat = (currentTime = "") => {
    if (!(currentTime >= 0) || currentTime === "") return "";

    let hour = parseInt(currentTime / 3600);
    let minute = parseInt((currentTime - (hour * 3600)) / 60);
    let seconde = parseInt((currentTime - (hour * 3600) - (minute * 60)) * 100) / 100;
    return `${hour >= 10 ? hour : `0${hour}`}:${minute >= 10 ? minute : `0${minute}`}:${seconde >= 10 ? seconde : `0${seconde}`}`
}

/**
 * 
 * @param {*} size base on byte size
 * @returns 
 */
exports.sizeToFormat = (size) => {

    if (!size) return ""

    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let byteSize = size;
    let unitIndex = 0;

    while (byteSize >= 1024 && unitIndex < units.length - 1) {
        byteSize /= 1024;
        unitIndex++;
    }

    return `${byteSize.toFixed(2)} ${units[unitIndex]}`;
}

exports.errorResponse = (message = "", name = "BAD_REQUEST", status = 400) => {
    if (!Array.isArray(message)) {
        message = [message];
    }

    return {
        status,
        name,
        message,
    };
};

exports.sendMail_tool = async (to, subject, text, html) => {
    try {
        const transporter = nodemailer.createTransport({
            secure: false,
            service: appConfigs.MAIL_SERVICE,
            auth: {
                user: appConfigs.MAIL_ADDRESS,
                pass: appConfigs.MAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: appConfigs.MAIL_ADDRESS,
            to,
            subject,
            text,
            html,
        });
    } catch (err) {
        throw ErrorResult.internal(err, null, "sendMail_tool");
    }
};

/* ------------------------- generating random code ------------------------- */
exports.generateRandomCode = (codeLength = 10) => {
    // random 4 digits number
    return (
        Math.floor(Math.random() * (9 * Math.pow(10, codeLength - 1))) +
        Math.pow(10, codeLength - 1)
    );
};

exports.makeSlug = (str) => {
    return str.trim().split(" ").join("_");
};

exports.createKeyIdObject = (arr) => {
    let object = {};
    arr.forEach((item) => (object[id] = item));
    return object;
};

exports.base64ToObject = (stringValue) => {
    const keyValuePairList = stringValue.split(",");
    return keyValuePairList.reduce((metadata, keyValuePair) => {
        let [key, base64Value] = keyValuePair.split(" ");
        metadata[key] = new Buffer(base64Value, "base64").toString("ascii");
        return metadata;
    }, {});
};

/* ---------------------------- create server url --------------------------- */
exports.createServerUrl = (path) => {
    if (path) {
        if (path.includes("http")) {
            return path;
        } else {
            return appConfigs.APP_URL + path;
        }
    } else {
        return null;
    }
};

/* ------------------------------ moving files ------------------------------ */
exports.moveFileTo = (from, to) => {
    return new Promise((resolve, reject) => {
        fs.rename(from, to, function (err) {
            if (err) {
                // logError("moveFileTo", err);
                return resolve(false);
            }
            return resolve(true);
        });
    });
};

exports.sortArrayAsArray = (data, sortByArray, key) => {
    try {
        let sortedContent = [];
        TypeTool.array(sortByArray).forEach((item) => {
            let content = data.find((c) => TypeTool.compare(c[key], item));
            if (content) {
                sortedContent.push(content);
            }
        });

        return sortedContent;
    } catch (err) {
        throw ErrorResult.internal(err, null, "sortArrayAsArray");
    }
};

/* ------------------------- get devices ip and info ------------------------ */
exports.getDeviceAndIpInfo = async (req, data = {}) => {
    let result = {};

    const { needDevice = true, needIp = true } = data;

    if (needDevice)
        result.device = deviceDetector.detect(req.headers["user-agent"]);
    if (needIp) result.ip = req.clientIp;

    return result;
};

/* ---------------- extracting authorization token of request --------------- */
exports.extractTokenFromRequest = (req) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
        return req.headers.authorization.split(" ")[1];
    }
    return null;
};


/* --------------------------- add data to request -------------------------- */
exports.addDataToRequest = async (req, ...data) => {
    data.forEach((data) => {
        Object.keys(data).forEach((key) => (req[key] = data[key]));
    });
};

/* --------------------- extract data from requset query -------------------- */
exports.reqQuery2Params = (req, validKey = []) => {
    let data = {};
    const reqQuery = req.query;

    if (!reqQuery) return data;

    for (const key in reqQuery) {
        if (validKey.length > 0 && !validKey.includes(key)) {
            continue;
        }

        try {
            data[key] = JSON.parse(reqQuery[key]);
        } catch (err) {
            data[key] = reqQuery[key];
        }
    }

    return data;
};

/* ---------------------- simple key existing validator --------------------- */
exports.validateNecessaryKeys = (keys, data) => {
    let errors = [];

    keys.forEach((key) => {
        if (!data[key]) errors.push(`${key} field is required!`);
    });

    if (errors.length > 0) throw ErrorResult.badRequest(errors);
    return true;
};

/* --------------------------- generate timestamp --------------------------- */
exports.generateTimestamp = () => {
    new Date().toISOString().slice(0, 19).replace("T", " ");
}

exports.convertNumber = (value) => {
    return value.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
}
exports.getOnlyNumber = (value) => {
    try {
        return this.convertNumber(value.toString().trim()).replace(/[^0-9]/g, "");
    }
    catch (error) {
        return false;
    }
}