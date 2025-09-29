const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const SampleCRUD_Controller = require("../../_default/controller/SampleCRUD.controller");
const Owner_DTO = require("../../dto/owner/Owner.dto");
const OwnerService = require("../../services/owner/Owner.service");
const OwnerValidation = require("../../validation/owner/Owner.validation");

class OwnerController extends SampleCRUD_Controller {
    constructor() {
        super({
            validation: OwnerValidation,
            service: OwnerService,
            DTO: Owner_DTO
        })
    }


    async getList(req, res) {
        const query = getDataFromReqQuery(req);

        const { rows, count } = await OwnerService.getList(query)
        return BaseController.ok(res, { rows: Owner_DTO.create(rows), count })
    }

}

module.exports = new OwnerController();