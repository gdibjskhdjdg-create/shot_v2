const Validation = require("../../_default/validation");

class ExportValidation extends Validation {
    constructor() {
        super();
    }

    createExport(data = {}) {
        this.setEmpty()

        const { title, sources, templateId } = data
    
        if (title?.length < 3) {
            this.setError("title is required");
        } else {
            this.setValidData("title", title);
        }

        if (!sources) {
            this.setError("source is required");
        }
        else {
            this.setValidData("sources", sources);
        }

        this.setValidData("templateId", templateId);

        return this.getResult();
    }
}

module.exports = new ExportValidation();