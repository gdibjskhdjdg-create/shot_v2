const ShotDefaultValueResponse = require("../../dto/shotList/ShotDefaultValue.response");
const ResponseDTO = require("../../_default/Response.dto");
const ShotDefaultValueValidation = require("../../validation/shotList/ShotDefaultValue.validation");
const ShotDefaultValueService = require("../../services/shotList/ShotDefaultValue.service");

async function fetch(req, res) {

    const response = await CategoryService.get(req.query);

    return ResponseDTO.success(res, CategoryResponse.create(response));
}

async function add(req, res) {
    const validData = await ShotDefaultValueValidation.create(req.body);
    const response = await ShotDefaultValueService.create(validData);

    return ResponseDTO.success(res, ShotDefaultValueResponse.create(response));
}

async function modify(req, res) {
    const { id } = req.params;
    const validData = await ShotDefaultValueValidation.update(id, req.body);
    const response = await ShotDefaultValueService.update(id, validData);

    return ResponseDTO.success(res, ShotDefaultValueResponse.create(response));
}

async function remove(req, res) {
    const { id } = req.params;
    await CategoryService.delete(id);
    return ResponseDTO.success(res);
}

async function fetchList(req, res) {
    const { section } = req.params

    const list = await ShotDefaultValueService.getList(section, req.query)
    return ResponseDTO.success(res, list)
}

async function fetchShots(req, res) {
    const { section, id } = req.params
    const shots = await ShotDefaultValueService.getShotsOfValue(section, id, req.query)
    return ResponseDTO.success(res, shots)
}

async function disconnectShot(req, res) {
    const { section, shotId } = req.params
    await ShotDefaultValueService.detachShotFromValue(section, shotId)
    return ResponseDTO.success(res)

}

module.exports = {
    fetch,
    add,
    modify,
    remove,
    fetchList,
    fetchShots,
    disconnectShot
}