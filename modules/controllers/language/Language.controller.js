const LanguageService = require("../../services/language/Language.service");
const LanguageValidation = require("../../validation/language/Language.validation");
const LanguageResponse = require("../../dto/language/Language.response");
const ResponseDTO = require("../../_default/Response.dto");

async function get(req, res) {

    const response = await LanguageService.get(req.query);

    return ResponseDTO.success(res, LanguageResponse.create(response));
}

async function create(req, res) {
    const validData = await LanguageValidation.create(req.body);
    const response = await LanguageService.create(validData);

    return ResponseDTO.success(res, LanguageResponse.create(response));
}

async function update(req, res) {
    const { id } = req.params;
    const validData = await LanguageValidation.update(id, req.body);
    const response = await LanguageService.update(id, validData);

    return ResponseDTO.success(res, LanguageResponse.create(response));
}

async function destroy(req, res) {
    const { id } = req.params;
    await LanguageService.delete(id);
    return ResponseDTO.success(res);
}


async function list(req, res) {
    const list = await LanguageService.getList(req.query)
    return ResponseDTO.success(res, list)
}

async function shots(req, res) {
    const { id } = req.params
    const shots = await LanguageService.getShotsOfLanguage(id, req.query)
    return ResponseDTO.success(res, shots)
}

async function removeShot(req, res) {
    const { id, shotId } = req.params
    await LanguageService.detachShotFromLanguage(id, shotId)
    return ResponseDTO.success(res)
}


module.exports = {
    get,
    list,
    create,
    update,
    destroy,
    shots,
    removeShot
}