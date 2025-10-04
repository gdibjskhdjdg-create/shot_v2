const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const SampleCRUD_Controller = require("../../_default/controller/SampleCRUD.controller");
const OwnerResponse = require("../../dto/owner/Owner.response");
const OwnerService = require("../../services/owner/Owner.service");
const OwnerValidation = require("../../validation/owner/Owner.validation");

class OwnerController extends SampleCRUD_Controller {
    constructor() {
        super({
            validation: OwnerValidation,
            service: OwnerService,
            Response: OwnerResponse
        })
    }

    async getList(req, res) {
        const query = getDataFromReqQuery(req);

        const { rows, count } = await OwnerService.getList(query)
        return BaseController.ok(res, { rows: OwnerResponse.create(rows), count })
    }


}

module.exports = new OwnerController()