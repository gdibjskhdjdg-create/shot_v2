const TypeTool = require("../../../helper/type.tool");
const Validation = require("../../_default/validation");


class ProjectValidation extends Validation {
    constructor() {
        super();
    }

    reqKey = ["title"];
    optionalKey = ["titleEn", "code", "workTimeRatio", "equalizeRatio", "template", "structure", "type", "producer", "director", "duration", "productionYear"];

    createProject(data = {}) {
        this.setEmpty()

        this.reqKey.forEach(item => {
            if (!TypeTool.boolean(data[item])) {
                this.setError(`${item} is required`)
            }
            this.setValidData(item, data[item])
        });


        this.optionalKey.forEach(item => {

            if (!TypeTool.isNullUndefined(data[item])) {
                this.setValidData(item, data[item])
            }
        });

        return this.getResult()
    }
}

module.exports = new ProjectValidation();