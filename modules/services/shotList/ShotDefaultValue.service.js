const { Shot, ShotDefaultValue, sequelize } = require("../../_default/model");
const TypeTool = require("../../../helper/type.tool");
const { createPaginationQuery } = require('../../../helper/SqlHelper.tool');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const QueryTypes = Sequelize.QueryTypes;

const getDefaultValues = async () => {
    const response = await ShotDefaultValue.findAll();
    const sections = [...new Set(response.map(item => item.section))];
    const defaultValues = {};
    sections.forEach(screenLeft => {
        defaultValues[screenLeft] = response.filter(item => item.section === screenLeft);
    });
    return defaultValues;
};

const findOrCreateDefaultValue = async ({ section = null, key = null, value = null }) => {
    if (section && key && value) {
        return await ShotDefaultValue.findOrCreate({ where: { section, key, value } });
    }
    return null;
};

const getShotColumnBySection = (section) => {
    const sectionCol = {
        "pictureType": "pictureTypeId",
        "pictureView": "pictureViewId",
        "pictureMode": "pictureModeId"
    };
    return sectionCol[section];
};

const listDefaultValues = async (section, filters = {}) => {
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

    if (search && search.trim().length > 0) {
        sqlQuery.where.key = { [Op.like]: `%${search}%` };
    }

    sqlQuery = createPaginationQuery(sqlQuery, page, take);

    const result = await ShotDefaultValue.findAndCountAll({
        distinct: true,
        ...sqlQuery,
    });

    if (shotUsageCount) {
        const valueIds = result.rows.map(item => item.id);
        const counts = await getValueUsageCounts(section, valueIds);

        result.rows = result.rows.map(item => {
            const col = getShotColumnBySection(section);
            const countOfValue = counts.find(it => it[col] === item.id);
            item.dataValues.count = countOfValue ? countOfValue.count : 0;
            return item;
        });
    }
    return result;
};

const getValueUsageCounts = async (section, valueIds) => {
    const col = getShotColumnBySection(section);
    const counts = await Shot.findAll({
        where: { [col]: valueIds },
        group: ['id'],
        attributes: [col, [Sequelize.fn('count', Sequelize.col('id')), 'count']],
    });
    return counts.map(item => item.toJSON());
};

const getShotsByValue = async (section, valueId, query = {}) => {
    const page = query.page || 1;
    const take = query.take || 10;
    const offset = (page - 1) * take;
    const col = getShotColumnBySection(section);

    const countQuery = `SELECT count(*) over() as total FROM (SELECT * FROM shots AS Shot WHERE ( SELECT id FROM shot_default_values AS valuesId WHERE (valuesId.id =:valueId AND valuesId.id = Shot."${col}") LIMIT 1 ) IS NOT NULL ) AS Shot INNER JOIN shot_default_values AS "valuesId" ON Shot."${col}" = "valuesId".id AND "valuesId".id=:valueId  group by Shot.id limit 1;`;
    const dataQuery = `SELECT count(Shot.id) as "valueCount", Shot.id as "shotId" , Shot.title as "shotTitle" FROM (SELECT * FROM shots AS Shot WHERE ( SELECT Shot.id FROM shot_default_values AS "valuesId" WHERE ("valuesId".id =:valueId AND "valuesId".id = Shot."${col}") LIMIT 1 ) IS NOT NULL limit :take offset :offset ) AS Shot INNER JOIN shot_default_values AS "valuesId" ON Shot."${col}" = "valuesId".id AND "valuesId".id=:valueId  group by Shot.id , Shot.title ;`;

    const replacements = { valueId, offset, take: +take };

    const totalResult = await sequelize.query(countQuery, { replacements, type: QueryTypes.SELECT });
    const rows = await sequelize.query(dataQuery, { replacements, type: QueryTypes.SELECT });

    return {
        count: totalResult?.[0]?.total || 0,
        rows,
    };
};

const detachShotFromValue = async (section, shotId) => {
    const col = getShotColumnBySection(section);
    await Shot.update({ [col]: null }, { where: { id: shotId } });
};

module.exports = {
    getDefaultValues,
    findOrCreateDefaultValue,
    getShotColumnBySection,
    listDefaultValues,
    getValueUsageCounts,
    getShotsByValue,
    detachShotFromValue,
};