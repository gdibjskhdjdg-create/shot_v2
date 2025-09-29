let { default: axios } = require("axios");
const ErrorResult = require("../helper/error.tool");

class Gateway {
    constructor(url, header = {}) {
        this.error = false;

        try {
            // Check if last character of url is /, remove that.
            let baseURL = url;
            if (baseURL.slice(-1) === '/') {
                baseURL = baseURL.slice(0, -1);
            }
            this.baseURL = baseURL;

            this.axios = axios.create({
                baseURL,
                headers: { ...header }
            });

            this.axios.interceptors.response.use((response) => {
                return response
            }, (error) => {
                if (error?.response?.status) {
                    const res = error?.response;
                    console.log(res);
                    // throw ErrorResult.createError(res.status, res.data.message)
                }
                else {
                    throw error;
                }
                throw error;
            })
        }
        catch (err) {
            console.log(err);
            this.error = true;
        }
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new this;
        }

        return this.instance;
    }
}

module.exports = Gateway;