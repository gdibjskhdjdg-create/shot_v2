const path = require("path");
const DTO = require("../../_default/DTO");
const Service = require("../../_default/service");

class VideoTemplate_DTO extends DTO {

    constructor(data) {
        super(data);

        const service = new Service();

        this.id = data.id;
        this.title = data.title;
        this.isMute = this.validate(["isMute"], "boolean");
        this.quality = this.validate(["quality"], "number");
        this.createdAt = data.createdAt;
        this.gifTime = data.gifTime;
        this.bitrate = this.validate(["bitrate"], "number");

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

module.exports = VideoTemplate_DTO;