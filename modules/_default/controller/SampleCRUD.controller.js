const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");


class SampleCRUD_Controller {

    constructor({
        validation = () => {},
        service = () => {},
        Response = () => {}
    }){
        this.service = service, 
        this.validation = validation;
        this.Response = Response;

        this.get = this.get.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }


    async get(req, res){
        const query = getDataFromReqQuery(req);
        const response = await this.service.get(query);

        return BaseController.ok(res, this.Response.create(response));
    }

    async create(req, res){
        const validData = await this.validation.create(req.body);
        const response = await this.service.create(validData);

        return BaseController.ok(res, this.Response.create(response));
    }

    async update(req, res){
        const { id } = req.params;
        const validData = await this.validation.update(id, req.body);
        const response = await this.service.update(id, validData);

        return BaseController.ok(res, this.Response.create(response));
    }

    async delete(req, res){
        const { id } = req.params;
        await this.service.delete(id);
        return BaseController.ok(res);
    }

}

module.exports = SampleCRUD_Controller;