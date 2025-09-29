const ObjectId = require('mongodb').ObjectId;
/* -------------------------------- Packages -------------------------------- */
const moment = require("moment");
const jalaliMoment = require('jalali-moment')
const { getOnlyNumber } = require("./general.tool");
const { isValidObjectId } = require('mongoose');

class TypeTool {
    // static date(_date){
    //     try {
    //         _date = _date.replace(new RegExp('-', 'g'), '/');
    //         _date = _date.split('/');

    //         if (parseInt(_date[1]) < 10) _date[1] = `0${parseInt(_date[1])}`;
    //         if (parseInt(_date[2]) < 10) _date[2] = `0${parseInt(_date[2])}`;

    //         return _date.join('/');
    //     }
    //     catch (err) {
    //         return null;
    //     }
    // }

    static isPhone(_phone) {
        _phone = getOnlyNumber(_phone);
        return (_phone && _phone.trim().length === 11 && _phone[0] === '0' && _phone[1] === '9');
    }

    static number(_number) {
        if (typeof _number === "number") {
            return _number;
        }
        if (_number === null || _number === undefined) {
            return 0;
        } else if (typeof _number === "boolean") {
            return _number ? 1 : 0;
        } else if (typeof _number === "string") {
            if (Number.isNaN(Number(_number))) {
                return 0;
            } else {
                return Number(_number);
            }
        } else {
            return 0;
        }
    }

    static objectId(_id) {
        return ObjectId(_id)
    }

    static compareObjectIds(_id_1, _id_2) {
        return _id_1?.toString() === _id_2?.toString();
    }

    static string(_string) {
        if (typeof _string === "string") {
            return _string;
        } else if (_string === null || _string === undefined) {
            return "";
        } else if (
            typeof _string === "number" ||
            typeof _string === "boolean"
        ) {
            return _string.toString();
        } else if (typeof _string === "object" || typeof _string === "array") {
            return "";
        } else {
            return "";
        }
    }

    static array(_array) {
        if (Array.isArray(_array)) {
            return _array;
        } else if (_array === null || _array === undefined) {
            return [];
        } else {
            return [_array];
        }
    }


    static boolean2Int(_boolean) {
        if (_boolean === null || _boolean === undefined) {
            return 0
        }

        if (typeof _boolean === "string") {
            if (_boolean === "true") {
                return 1;
            } else if (_boolean === "false") {
                return 0;
            } else {
                return this.isNotEmptyString(_boolean);
            }
        }

        if (
            typeof _boolean === "object" &&
            Object.keys(_boolean).length === 0 &&
            !(_boolean instanceof Date)
        ) {
            return 0;
        }

        return _boolean ? 1 : 0
    }

    static boolean(_boolean) {

        if (_boolean === null || _boolean === undefined) {
            return false;
        } else if (typeof _boolean === "boolean") {
            return _boolean;
        } else if (typeof _boolean === "string") {
            if (_boolean === "true") {
                return true;
            } else if (_boolean === "false") {
                return false;
            } else {
                return this.isNotEmptyString(_boolean);
            }
        } else if (typeof _boolean === "number") {
            return _boolean > 0;
        } else if (
            typeof _boolean === "object" &&
            Object.keys(_boolean).length === 0 &&
            !(_boolean instanceof Date)
        ) {
            return false;
        } else {
            return !!_boolean;
        }
    }

    static isEmpty(_var) {
        if (_var === null || _var === undefined) {
            return true;
        } else if (typeof _var === "object") {
            return !(Object.keys(_var).length > 0);
        } else if (typeof _var === "array") {
            return !(_var.length > 0);
        } else if (typeof _var === "string") {
            return !this.isNotEmptyString(_var);
        } else {
            return !!!_var;
        }
    }

    static isObjectId(_objectId) {
        if (!TypeTool.boolean(_objectId)) {
            return false;
        }
        return isValidObjectId(_objectId)
    }

    static isNullUndefined(_var) {
        return _var === null || _var === undefined;
    }

    static isUndefined(_var) {
        return _var === undefined
    }

    static isNotEmptyString(_string) {
        let validString = this.string(_string);
        return validString.trim().length > 0;
    }

    static timestamp(_timestamp) {
        if (TypeTool.number(_timestamp) === 0) {
            return 0;
        }

        while (true) {
            if (TypeTool.string(_timestamp).length !== 13) {
                _timestamp = TypeTool.number(_timestamp) * 10;
            } else {
                break;
            }
        }

        return _timestamp;
    }

    static date(timestamp, format) {
        timestamp = TypeTool.timestamp(timestamp);
        return moment(TypeTool.number(timestamp)).format(format);
    }

    static jalaliDateToTimestamp(date, format = 'jYYYY/jMM/jDD') {
        const jalaliDate = jalaliMoment(date, format); // Specify the Jalali date and its format
        const unixTimestamp = jalaliDate.valueOf(); // Get the timestamp for the Jalali date
        return unixTimestamp
    }

    static isValidJalaliDate(date) {
        if (!date || /^\d{4}\/(\d{2})\/(\d{2})$/.test(date) == false) return false
        return jalaliMoment(date, 'jYYYY/jMM/jDD').isValid()
    }

    static timestampToJalaliDate(timestamp, format = 'jYYYY/jMM/jDD') {
        try {
            const jalaliDate = jalaliMoment(timestamp); // Convert Unix timestamp to Jalali date
            return (jalaliDate.format(format)); // Output the Jalali date in the desired format
        } catch (error) {
            return timestamp
        }

    }

    static compare(_object1, _object2) {
        if (typeof _object1 !== "object" || typeof _object2 !== "object") {
            return TypeTool.string(_object1) === TypeTool.string(_object2);
        } else {
            return TypeTool.compareObjects(_object1, _object2);
        }
    }

    static compareObjects(_object1, _object2) {
        if (typeof _object1 !== "object" || typeof _object2 !== "object") {
            return TypeTool.compare(_object1, _object2);
        } else {
            return JSON.stringify(_object1) === JSON.stringify(_object2);
        }
    }
}

module.exports = TypeTool;
