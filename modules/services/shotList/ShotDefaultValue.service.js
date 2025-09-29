const SampleCRUD_Service = require("../../_default/service/SampleCRUD.service");
const { Shot, ShotDefaultValue, sequelize } = require("../../_default/model");
const TypeTool = require("../../../helper/type.tool");
const { createPaginationQuery } = require('../../../helper/SqlHelper.tool');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const QueryTypes = Sequelize.QueryTypes

class ShotDefaultValueService extends SampleCRUD_Service {
    constructor() {
        super(ShotDefaultValue)
    }

    async getDefault() {
        const response = await this.get();
        let sections = [...(new Set(response.map(item => item.section)))]
        let defaultValues = {};
        sections.forEach(screenLeft => {
            defaultValues[screenLeft] = response.filter(item => item.section === screenLeft)
        })

        return defaultValues;
    }

    async checkAndCreateDefaultValue({ section = null, key = null, value = null }) {
        let defaultValue = null;
        if (section && key && value) {
            defaultValue = await ShotDefaultValue.findOrCreate({ where: { section, key, value } });
        }

        return defaultValue;
    }

    shotColBySection(section) {
        const sectionCol = {
            "pictureType": "pictureTypeId",
            "pictureView": "pictureViewId",
            "pictureMode": "pictureModeId"
        }
        return sectionCol[section]
    }

    async getList(section, filters = {}) {
        const {
            search = null,
            page = null,
            take = null,
            shotUsageCount = false,
        } = filters;


        let sqlQuery = {
            where: { section },
            include: []
        };

        if (!TypeTool.isNullUndefined(search) && search.toString().trim().length > 0) {
            sqlQuery.where.key = { [Op.like]: `%${search}%` }
        }

        sqlQuery = createPaginationQuery(sqlQuery, page, take);

        let value = await ShotDefaultValue.findAndCountAll({
            distinct: true,
            ...sqlQuery,
        });

        if (shotUsageCount) {
            let valuesId = value.rows.map(item => item.id);
            const counts = await this.getValueUsageCount(section, valuesId);

            value.rows = value.rows.map(item => {
                const col = this.shotColBySection(section)
                const countOfValue = counts.find(it => it[col] === item.id);
                if (countOfValue) {
                    item.dataValues.count = countOfValue.count;
                }
                else {
                    item.dataValues.count = 0;
                }
                return item;
            })
        }
        return value;
    }

    async getValueUsageCount(section, valuesId) {
        const col = this.shotColBySection(section)
        let counts = await Shot.findAll({
            where: { [col]: valuesId },
            group: ['id'],
            attributes: [col, [Sequelize.fn('count', Sequelize.col('id')), 'count']],
        })

        return counts.map(item => item.toJSON());
    }

    async getShotsOfValue(section, valueId, query = {}) {
        const page = query.page || 1;
        const take = query.take || 10;
        const offset = (+page - 1) * +take;

        const col = this.shotColBySection(section);


        const sqlQueryForCount = `SELECT count(*) over() as total FROM (SELECT * FROM shots AS Shot WHERE ( SELECT id FROM shot_default_values AS valuesId WHERE (valuesId.id =:valueId AND valuesId.id = Shot."${col}") LIMIT 1 ) IS NOT NULL ) AS Shot INNER JOIN shot_default_values AS "valuesId" ON Shot."${col}" = "valuesId".id AND "valuesId".id=:valueId  group by Shot.id limit 1;`

        const sqlQuery = `SELECT count(Shot.id) as "valueCount", Shot.id as "shotId" , Shot.title as "shotTitle" FROM (SELECT * FROM shots AS Shot WHERE ( SELECT Shot.id FROM shot_default_values AS "valuesId" WHERE ("valuesId".id =:valueId AND "valuesId".id = Shot."${col}") LIMIT 1 ) IS NOT NULL limit :take offset :offset ) AS Shot INNER JOIN shot_default_values AS "valuesId" ON Shot."${col}" = "valuesId".id AND "valuesId".id=:valueId  group by Shot.id , Shot.title ;`  // <-- add Shot.title


        const replacements = {
            valueId,
            offset: offset,
            take: +take
        };

        const totalItems = await sequelize.query(sqlQueryForCount, {
            replacements,
            type: QueryTypes.SELECT
        });

        const rows = await sequelize.query(sqlQuery, {
            replacements,
            type: QueryTypes.SELECT
        });

        return {
            count: totalItems?.[0]?.total || 0,
            rows
        };
    }

    async detachShotFromValue(section, shotId) {
        const col = this.shotColBySection(section)
        await Shot.update({ [col]: null }, { where: { id: shotId } });
    }
}

module.exports = new ShotDefaultValueService();