const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const QueryTypes = Sequelize.QueryTypes;

const TypeTool = require("../../../helper/type.tool");
const Service = require("../../_default/service");
const { Keyword, KeywordRelCategory, ShotRelKeyword, CategoryKeyword, KeywordLocation, KeywordEvent, sequelize } = require("../../_default/model");
const { createPaginationQuery } = require('../../../helper/SqlHelper.tool');
const ErrorResult = require('../../../helper/error.tool');

class KeywordInVideo extends Service {

    constructor() {
        super(Keyword);
    }

    async getKeywords(filters = {}) {
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
                model: ShotRelKeyword,
                as: 'shot_keyword',
                where: { inVideo: 1 },
                required: true,
            }],
        };

        if (!TypeTool.isNullUndefined(search) && search.toString().trim().length > 0) {
            sqlQuery.where.keyword = { [Op.like]: `%${search}%` };
        }
        if (!TypeTool.isNullUndefined(type)) {
            sqlQuery.where.type = type;
        }

        if (TypeTool.isNotEmptyString(categoryId)) {
            sqlQuery.include.push({
                model: KeywordRelCategory,
                as: `keyword_rel_category`,
                where: { categoryId },
                required: true,
            });
        }

        sqlQuery = createPaginationQuery(sqlQuery, page, take);

        let keyword = await Keyword.findAndCountAll({
            distinct: true,
            ...sqlQuery,
        });

        if (shotUsageCount) {
            let keywordIds = keyword.rows.map(item => item.id);

            const keywordShot = await this.getKeywordShotUsage(keywordIds);

            keyword.rows = keyword.rows.map(item => {
                const keywordShotOfKeyword = keywordShot.filter((x) => x.keywordId == item.id);
                item.dataValues.shotCount = keywordShotOfKeyword.length;

                for (const ks of keywordShotOfKeyword) {
                    const otherInfo = ks.otherInfo ? JSON.parse(ks.otherInfo) : null;

                    if (!item.dataValues.hasOwnProperty("count")) {
                        item.dataValues.count = 0;
                    }

                    if (otherInfo) {
                        item.dataValues.count += otherInfo['times'].reduce((acc, data) => acc + data.positions.length, 0);
                    }
                }

                return item;
            });
        }
        return keyword;
    }

    async getShotsOfKeyword(keywordId, query = {}) {
        const page = query.page || 1;
        const take = query.take || 10;

        const sqlQueryForCount = `SELECT count(*) over() as total FROM (SELECT * FROM shots AS Shot WHERE ( SELECT "shotId" FROM shot_keyword AS "keywordIds" WHERE ("keywordIds"."keywordId" =:keywordId AND "keywordIds"."shotId" = Shot.id AND "keywordIds"."inVideo" = 1  ) LIMIT 1 ) IS NOT NULL ) AS Shot INNER JOIN shot_keyword AS "keywordIds" ON Shot.id = "keywordIds"."shotId" AND "keywordIds"."keywordId"=:keywordId AND "keywordIds"."inVideo" = 1  group by Shot.id limit 1;`;
        
        const sqlQuery = `SELECT Shot.id as shotId, Shot.title as "shotTitle", "keywordIds"."otherInfo" as "otherInfo" FROM (SELECT * FROM shots AS Shot WHERE ( SELECT Shot.id FROM shot_keyword AS "keywordIds" WHERE ("keywordIds"."keywordId" =:keywordId AND "keywordIds"."shotId" = Shot.id AND "keywordIds"."inVideo" = 1  ) LIMIT 1 ) IS NOT NULL limit :take offset :offset ) AS Shot INNER JOIN shot_keyword AS "keywordIds" ON Shot.id = "keywordIds"."shotId" AND "keywordIds"."keywordId" =:keywordId AND "keywordIds"."inVideo" = 1 group by Shot.id ;`;

        const replacements = { keywordId, offset: (+page - 1) * +take, take };

        const totalItems = (await sequelize.query(sqlQueryForCount, { replacements, type: QueryTypes.SELECT }));
        const rows = await sequelize.query(sqlQuery, { replacements, type: QueryTypes.SELECT });

        for (const item of rows) {
            const otherInfo = item.otherInfo ? JSON.parse(item.otherInfo) : null;

            if (!item.hasOwnProperty("keywordCount")) {
                item.keywordCount = 0;
            }

            if (otherInfo) {
                item.keywordCount += otherInfo['times'].reduce((acc, data) => acc + data.positions.length, 0);
            }
        }

        return { count: totalItems?.[0]?.total || 0, rows };
    }

    async getKeywordShotUsage(keywordIds) {
        let keywordShot = await ShotRelKeyword.findAll({
            where: { keywordId: keywordIds, inVideo: 1 },
            attributes: ['keywordId', 'otherInfo'],
        });

        return keywordShot.map(item => item.toJSON());
    }

    async detachShotFromKeyword(keywordId, shotId) {
        return await ShotRelKeyword.destroy({
            where: {
                shotId,
                inVideo: 1,
                keywordId
            }
        });
    }

    async deleteKeyword(keywordId) {
        const keywordIsInVideo = await ShotRelKeyword.findOne({ where: { keywordId } });
        if (keywordIsInVideo) {
            return Keyword.destroy({ where: { id: keywordId } });
        } else {
            throw ErrorResult.badRequest("keyword is not in video");
        }
    }

}

module.exports = new KeywordInVideo();