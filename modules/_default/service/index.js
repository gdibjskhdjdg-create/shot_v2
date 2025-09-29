const ErrorResult = require("../../../helper/error.tool");

class Service {
    constructor(model){
        this.model = model;
    }

    getModel(){
        return this.model;
    }

    generateDownloadLink(path){
        path = path.replaceAll("\\", "/");
        if (path[0] !== '/') {
            path = `/${path}`
        }

        return `${appConfigs.STORE_URL}${path}`;
    }

    generateNormalLink(path){
        path = path.replaceAll("\\", "/");

        if (path[0] !== '/') {
            path = `/${path}`
        }

        return `${appConfigs.STORE_URL}${path}`;
    }

    async getByAttribute(key, value){
        return await this.model.findAll({ where: { [key]: value } });
    }

    async getByIds(id){
        const data = await this.model.findAll({ where: { id }});
        return data;
    }

    async getById(id, otherInfo = {}){
        const { 
            transaction = null 
        } = otherInfo;

        const data = await this.model.findByPk(id, { transaction });
        if(
            !data
            || data.deletedAt
        ){
            throw ErrorResult.notFound();
        }

        return data;
    }

    async createBulk(data, other = {}){
        const { transaction = null } = other;
        return await this.model.bulkCreate(data, { transaction });
    }
}

module.exports = Service;