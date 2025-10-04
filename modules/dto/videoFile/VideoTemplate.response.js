const path = require("path");
const BaseResponse = require("../../_default/BaseResponse");
const Service = require("../../_default/service");

class VideoTemplateResponse extends BaseResponse {

    constructor(data) {
        super(data);

        const service = new Service();

        this.id = data.id;
        this.title = data.title;
        this.isMute = this.setValue(["isMute"], "boolean");
        this.quality = this.setValue(["quality"], "number");
        this.createdAt = this.setValue(['data'], data.createdAt);
        this.gifTime = data.gifTime;
        this.bitrate = this.setValue(["bitrate"], "number");

        if (data?.logoParams) {
            try {
                this.logoParams = JSON.parse(data?.logoParams);
                this.logoParams = {
                    ...this.logoParams,
                    url: service.generateNormalLink(this.logoParams.src)
                }

                console.log(33333333, this.logoParams)
            }
            catch (err) {
                this.logoParams = "";
            }
        }
    }
}

module.exports = VideoTemplateResponse;