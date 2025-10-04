const ResponseDTO = require("../../_default/Response.dto");
const CategoryResponse = require("../../dto/category/Category.response");
const CategoryService = require("../../services/category/Category.service");
const CategoryValidation = require("../../validation/category/Category.validation");
const { getDataFromReqQuery } = require("../../../helper/general.tool");

async function get(req, res) {
    const query = getDataFromReqQuery(req);
    const response = await CategoryService.get(query);

    return ResponseDTO.success(res, CategoryResponse.create(response));
}

async function create(req, res) {
    const validData = await CategoryValidation.create(req.body);
    const response = await CategoryService.create(validData);

    return ResponseDTO.success(res, CategoryResponse.create(response));
}

async function update(req, res) {
    const { id } = req.params;
    const validData = await CategoryValidation.update(id, req.body);
    const response = await CategoryService.update(id, validData);

    return ResponseDTO.success(res, CategoryResponse.create(response));
}

async function destroy(req, res) {
    const { id } = req.params;
    await CategoryService.delete(id);
    return ResponseDTO.success(res);
}


async function list(req, res) {
    const query = getDataFromReqQuery(req);

    const list = await CategoryService.getList(query)
    return ResponseDTO.success(res, list)
}

async function shots(req, res) {
    const { id } = req.params
    const query = getDataFromReqQuery(req);
    const shots = await CategoryService.getShotsOfCategory(id, query)
    return ResponseDTO.success(res, shots)
}

async function removeShot(req, res) {
    const { id, shotId } = req.params
    await CategoryService.detachShotFromCategory(id, shotId)
    return ResponseDTO.success(res)

}


module.exports = {
    get,
    create,
    update,
    destroy,
    list,
    shots,
    removeShot
}