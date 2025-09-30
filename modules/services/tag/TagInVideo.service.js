const { Op, QueryTypes } = require('sequelize');
const TypeTool = require("../../../helper/type.tool");
const { Tag, TagRelCategory, ShotRelTag, sequelize } = require("../../_default/model");
const { createPaginationQuery } = require('../../../helper/SqlHelper.tool');
const ErrorResult = require('../../../helper/error.tool');

const getShotUsage = async (tagIds) => {
    const tagShots = await ShotRelTag.findAll({
        where: { tagId: tagIds, inVideo: 1 },
        attributes: ['tagId', 'otherInfo'],
    });
    return tagShots.map(item => item.toJSON());
};

const get = async (filters = {}) => {
    const {
        categoryId = "",
        search = null,
        type = null,
        page = null,
        take = null,
        shotUsageCount = false,
    } = filters;

    let sqlQuery = {
        where: {
            isCategory: 0
        },
        include: [{
            model: ShotRelTag,
            as: 'shot_tag',
            where: { inVideo: 1 },
            required: true,
        }],
    };

    if (!TypeTool.isNullUndefined(search) && search.toString().trim().length > 0) {
        sqlQuery.where.tag = { [Op.like]: `%${search}%` };
    }
    if (!TypeTool.isNullUndefined(type)) {
        sqlQuery.where.type = type;
    }

    if (TypeTool.isNotEmptyString(categoryId)) {
        sqlQuery.include.push({
            model: TagRelCategory,
            as: `tag_rel_category`,
            where: { categoryId },
            required: true,
        });
    }

    sqlQuery = createPaginationQuery(sqlQuery, page, take);

    let tags = await Tag.findAndCountAll({
        distinct: true,
        ...sqlQuery,
    });

    if (shotUsageCount) {
        let tagIds = tags.rows.map(item => item.id);
        const tagShot = await getShotUsage(tagIds);

        tags.rows = tags.rows.map(item => {
            const tagShotOfTag = tagShot.filter((x) => x.tagId == item.id);
            item.dataValues.shotCount = tagShotOfTag.length;
            item.dataValues.count = 0;

            for (const ts of tagShotOfTag) {
                const otherInfo = ts.otherInfo ? JSON.parse(ts.otherInfo) : null;
                if (otherInfo) {
                    item.dataValues.count += otherInfo['times'].reduce((acc, data) => acc + data.positions.length, 0);
                }
            }
            return item;
        });
    }
    return tags;
};

const getShots = async (tagId, query = {}) => {
    const page = query.page || 1;
    const take = query.take || 10;

    const sqlQueryForCount = `SELECT count(*) over() as total FROM (SELECT * FROM shots AS Shot WHERE ( SELECT "shotId" FROM shot_tag AS "tagIds" WHERE ("tagIds"."tagId" =:tagId AND "tagIds"."shotId" = Shot.id AND "tagIds"."inVideo" = 1  ) LIMIT 1 ) IS NOT NULL ) AS Shot INNER JOIN shot_tag AS "tagIds" ON Shot.id = "tagIds"."shotId" AND "tagIds"."tagId"=:tagId AND "tagIds"."inVideo" = 1  group by Shot.id limit 1;`;
    const sqlQuery = `SELECT Shot.id as shotId, Shot.title as "shotTitle", "tagIds"."otherInfo" as "otherInfo" FROM (SELECT * FROM shots AS Shot WHERE ( SELECT Shot.id FROM shot_tag AS "tagIds" WHERE ("tagIds"."tagId" =:tagId AND "tagIds"."shotId" = Shot.id AND "tagIds"."inVideo" = 1  ) LIMIT 1 ) IS NOT NULL limit :take offset :offset ) AS Shot INNER JOIN shot_tag AS "tagIds" ON Shot.id = "tagIds"."shotId" AND "tagIds"."tagId" =:tagId AND "tagIds"."inVideo" = 1 group by Shot.id ;`;

    const replacements = { tagId, offset: (+page - 1) * +take, take };

    const totalItems = (await sequelize.query(sqlQueryForCount, { replacements, type: QueryTypes.SELECT }));
    const rows = await sequelize.query(sqlQuery, { replacements, type: QueryTypes.SELECT });

    for (const item of rows) {
        const otherInfo = item.otherInfo ? JSON.parse(item.otherInfo) : null;
        item.tagCount = 0;
        if (otherInfo) {
            item.tagCount += otherInfo['times'].reduce((acc, data) => acc + data.positions.length, 0);
        }
    }

    return { count: totalItems?.[0]?.total || 0, rows };
};

const detachShot = async (tagId, shotId) => {
    return await ShotRelTag.destroy({
        where: {
            shotId,
            inVideo: 1,
            tagId
        }
    });
};

const deleteOne = async (tagId) => {
    const tagIsInVideo = await ShotRelTag.findOne({ where: { tagId } });
    if (!tagIsInVideo) {
        throw ErrorResult.badRequest("tag is not in video");
    }
    return Tag.destroy({ where: { id: tagId } });
};

module.exports = {
    get,
    getShots,
    getShotUsage,
    detachShot,
    deleteOne,
};