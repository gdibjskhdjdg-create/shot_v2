const TypeTool = require("../../../helper/type.tool");
const Validation = require("../../_default/validation");

class VideoTemplateValidation extends Validation {
    constructor() {
        super();
    }

    createTemplate(data = {}) {
        this.setEmpty()

        const {
            quality = '480',
            isMute = 'false',
            bitrate = null,
            gifTime = null,
            title = null,
            logo = null,
            text = null,
        } = data;


        if (title?.value?.length >= 3) {
            this.setValidData("title", title.value);
        } else {
            this.setError("title is required");
        }

        this.setValidData("quality", quality.value);
        this.setValidData("isMute", isMute?.value);
        this.setValidData("bitrate", bitrate?.value);
        this.setValidData("gifTime", gifTime?.value);
        this.setValidData("logo", logo?.value ? JSON.parse(logo?.value) : null);
        this.setValidData("text", text?.value ? JSON.parse(text.value) : null);

        return this.getResult();
    }

    updateTemplate(data = {}) {
        this.setEmpty()

        const title = data.title
        const quality = data.quality
        const isMute = data.isMute
        const bitrate = data.bitrate
        const logo = data.logo
        const text = data.text
        const gifTime = data.gifTime

        if (title?.value) {
            if (title.value.length < 3) {
                this.setError("title is required");
            } else {
                this.setValidData("title", title.value);
            }
        }

        if (quality?.value) {
            this.setValidData("quality", +quality.value);
        }

        if (gifTime?.value) {
            this.setValidData("gifTime", gifTime.value);
        }

        if (!TypeTool.isNullUndefined(isMute?.value)) {
            this.setValidData("isMute", isMute.value);
        }

        if (bitrate?.value) {
            this.setValidData("bitrate", bitrate.value);
        }

        if (logo?.value) {
            this.setValidData("logo", JSON.parse(logo.value));
        }

        if (text?.value) {
            this.setValidData("text", JSON.parse(text.value));
        }

        return this.getResult();
    }
}

module.exports = new VideoTemplateValidation();