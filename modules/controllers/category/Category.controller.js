const SampleCRUD_Controller = require("../../_default/controller/SampleCRUD.controller");
const BaseController = require("../../_default/controller/Base.controller");
const CategoryResponse = require("../../dto/category/Category.response");
const CategoryService = require("../../services/category/Category.service");
const CategoryValidation = require("../../validation/category/Category.validation");
const { getDataFromReqQuery } = require("../../../helper/general.tool");

class CategoryController extends SampleCRUD_Controller {
    constructor() {
        super({
            validation: CategoryValidation,
            service: CategoryService,
            Response: CategoryResponse
        })
    }


    async getList(req, res) {
        const query = getDataFromReqQuery(req);

        const list = await CategoryService.getList(query)
        return BaseController.ok(res, list)
    }

    async getShots(req, res) {
        const { id } = req.params
        const query = getDataFromReqQuery(req);
        const shots = await CategoryService.getShotsOfCategory(id, query)
        return BaseController.ok(res, shots)
    }

    async detachShot(req, res) {
        const { id, shotId } = req.params
        await CategoryService.detachShotFromCategory(id, shotId)
        return BaseController.ok(res)

    }

}
module.exports = new CategoryController()