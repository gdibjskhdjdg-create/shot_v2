const ResponseDTO = require("../../_default/Response.dto");
const { getDataFromReqQuery } = require("../../../helper/general.tool");
const OwnerResponse = require("../../dto/owner/Owner.response");
const OwnerService = require("../../services/owner/Owner.service");
const OwnerValidation = require("../../validation/owner/Owner.validation");

async function get(req, res) {
    const query = getDataFromReqQuery(req);
    const response = await OwnerService.get(query);

    return ResponseDTO.success(res, OwnerResponse.create(response));
}

async function create(req, res) {
    const validData = await OwnerValidation.create(req.body);
    const response = await OwnerService.create(validData);

    return ResponseDTO.success(res, OwnerResponse.create(response));
}

async function update(req, res) {
    const { id } = req.params;
    const validData = await OwnerValidation.update(id, req.body);
    const response = await OwnerService.update(id, validData);

    return ResponseDTO.success(res, OwnerResponse.create(response));
}

async function destroy(req, res) {
    const { id } = req.params;
    await LanguageService.delete(id);
    return ResponseDTO.success(res);
}


async function list(req, res) {
    const query = getDataFromReqQuery(req);

    const { rows, count } = await OwnerService.getList(query)
    return ResponseDTO.success(res, { rows: OwnerResponse.create(rows), count })
}



module.exports = {
    get,
    create,
    update,
    destroy,
    list
}