const ErrorResult = require("../../helper/error.tool");


class Validation{
    constructor(){
        this.errors = [];
        this.validData = {};
    }

    setEmpty(){
        this.errors = [];
        this.validData = {};
    }

    setValidData(key, value){
        if(Array.isArray(key)){
            for(let i = 1; i < key.length; i++){
                if(!this.validData.hasOwnProperty(key[i - 1])){
                    this.validData[key[i - 1]] = {}
                }

                this.validData[key[i - 1]] = {
                    ...this.validData[key[i - 1]],
                    [key[i]]: value
                }
            }
        }
        else{
            this.validData[key] = value;
        }
    }
    setError(code){
        this.errors.push(code);
    }

    checkError(){
        if(this.errors.length > 0){
            throw ErrorResult.badRequest(null, this.errors)
        }
    }
    getResult(){
        if(this.errors.length > 0){
            throw ErrorResult.badRequest(null, this.errors)
        }
        return this.validData;
    }
}

module.exports = Validation;