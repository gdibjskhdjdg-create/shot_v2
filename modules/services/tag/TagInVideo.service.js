const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const QueryTypes = Sequelize.QueryTypes

const TypeTool = require("../../../helper/type.tool");
const Service = require("../../_default/service");
const { Tag, TagRelCategory, ShotRelTag, CategoryTag, TagLocation, TagEvent, sequelize } = require("../../_default/model");
const { createPaginationQuery } = require('../../../helper/SqlHelper.tool');
const ErrorResult = require('../../../helper/error.tool');

class TagInVideo extends Service {

    constructor() {
        super(Tag)
    }

    async getTags(filters = {}) {
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
            sqlQuery.where.tag = { [Op.like]: `%${search}%` }
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
            })
        }

        sqlQuery = createPaginationQuery(sqlQuery, page, take);

        let tag = await Tag.findAndCountAll({
            distinct: true,
            ...sqlQuery,
        });


        if (shotUsageCount) {
            let tagIds = tag.rows.map(item => item.id);

            const tagShot = await this.getTagShotUsage(tagIds);

            tag.rows = tag.rows.map(item => {

                const tagShotOfTag = tagShot.filter((x) => x.tagId == item.id)
                item.dataValues.shotCount = tagShotOfTag.length

                for (const ts of tagShotOfTag) {
                    const otherInfo = ts.otherInfo ? JSON.parse(ts.otherInfo) : null

                    if (!item.dataValues.hasOwnProperty("count")) {
                        item.dataValues.count = 0
                    }

                    if (otherInfo) {
                        item.dataValues.count += otherInfo['times'].reduce((acc, data) => acc + data.positions.length, 0);
                    }

                }

                return item;
            })
        }
        return tag;
    }

    async getShotsOfTag(tagId, query = {}) {

        const page = query.page || 1
        const take = query.take || 10

        const sqlQueryForCount = `SELECT count(*) over() as total FROM (SELECT * FROM shots AS Shot WHERE ( SELECT "shotId" FROM shot_tag AS "tagIds" WHERE ("tagIds"."tagId" =:tagId AND "tagIds"."shotId" = Shot.id AND "tagIds"."inVideo" = 1  ) LIMIT 1 ) IS NOT NULL ) AS Shot INNER JOIN shot_tag AS "tagIds" ON Shot.id = "tagIds"."shotId" AND "tagIds"."tagId"=:tagId AND "tagIds"."inVideo" = 1  group by Shot.id limit 1;`
        
        const sqlQuery = `SELECT Shot.id as shotId, Shot.title as "shotTitle", "tagIds"."otherInfo" as "otherInfo" FROM (SELECT * FROM shots AS Shot WHERE ( SELECT Shot.id FROM shot_tag AS "tagIds" WHERE ("tagIds"."tagId" =:tagId AND "tagIds"."shotId" = Shot.id AND "tagIds"."inVideo" = 1  ) LIMIT 1 ) IS NOT NULL limit :take offset :offset ) AS Shot INNER JOIN shot_tag AS "tagIds" ON Shot.id = "tagIds"."shotId" AND "tagIds"."tagId" =:tagId AND "tagIds"."inVideo" = 1 group by Shot.id ;`

        const replacements = { tagId, offset: (+page - 1) * +take, take }

        const totalItems = (await sequelize.query(sqlQueryForCount, { replacements, type: QueryTypes.SELECT }));
        const rows = await sequelize.query(sqlQuery, { replacements, type: QueryTypes.SELECT });

        for (const item of rows) {
            const otherInfo = item.otherInfo ? JSON.parse(item.otherInfo) : null

            if (!item.hasOwnProperty("tagCount")) {
                item.tagCount = 0
            }

            if (otherInfo) {
                item.tagCount += otherInfo['times'].reduce((acc, data) => acc + data.positions.length, 0);
            }

        }

        return { count: totalItems?.[0]?.total || 0, rows }
    }

    async getTagShotUsage(tagIds) {
        let tagShot = await ShotRelTag.findAll({
            where: { tagId: tagIds, inVideo: 1 },
            attributes: ['tagId', 'otherInfo'],
        })

        return tagShot.map(item => item.toJSON());
    }

    async detachShotFromTag(tagId, shotId) {


        return await ShotRelTag.destroy({
            where: {
                shotId,
                inVideo: 1,
                tagId
            }
        })
    }

    async deleteTag(tagId) {
        const tagIsInVideo = await ShotRelTag.findOne({ tagId })
        if (tagIsInVideo) {
            return Tag.destroy({ where: { tagId } })
        } else {
            throw ErrorResult.badRequest("tag is not in video")
        }
    }


}

module.exports = new TagInVideo();