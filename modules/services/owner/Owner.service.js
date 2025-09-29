const SampleCRUD_Service = require("../../_default/service/SampleCRUD.service");
const { Owner } = require("../../_default/model");
const TypeTool = require("../../../helper/type.tool");
const { createPaginationQuery } = require("../../../helper/SqlHelper.tool");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

class OwnerService extends SampleCRUD_Service {
    constructor() {
        super(Owner)
    }

    async getList(filters = {}) {

        const {
            ownerId = null,
            search = null,
            page = null,
            take = null,
            // shotUsageCount = false,
        } = filters;


        let sqlQuery = {
            where: {},
            include: []
        };

        if (!TypeTool.isNullUndefined(ownerId)) {
            sqlQuery.where.id = ownerId
        }

        if (!TypeTool.isNullUndefined(search) && search.toString().trim().length > 0) {
            sqlQuery.where.name = { [Op.like]: `%${search}%` }
        }

        sqlQuery = createPaginationQuery(sqlQuery, page, take);

        let items = await Owner.findAndCountAll({
            distinct: true,
            ...sqlQuery,
        });
        
        const { rows, count } = items

        return { rows, count }

    }
}

module.exports = new OwnerService();