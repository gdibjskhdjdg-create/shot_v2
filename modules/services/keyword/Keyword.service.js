const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const QueryTypes = Sequelize.QueryTypes

const TypeTool = require("../../../helper/type.tool");
const Service = require("../../_default/service");
const { Keyword, KeywordRelCategory, CategoryKeyword, KeywordLocation, KeywordEvent, ShotRelKeyword, sequelize } = require("../../_default/model");
const { createPaginationQuery } = require('../../../helper/SqlHelper.tool');
const TableCountService = require('../tableCount/TableCount.service');

class KeywordService extends Service {

    constructor() {
        super(Keyword)
    }

    async getKeywords(filters = {}) {

        const {
            categoryId = "",
            excludeId = null,
            search = null,
            type = null,
            page = null,
            take = null,
            sortKey = "createdAt",
            sortACS = "DESC",
        } = filters;

        let sqlQuery = {
            where: { isCategory: 0 },
            include: []
        };

        if (!TypeTool.isNullUndefined(search) && search.toString().trim().length > 0) {
            sqlQuery.where.keyword = { [Op.like]: `%${search}%` }
        }

        if (!!excludeId) sqlQuery.where.id = { [Op.not]: excludeId }

        if (!TypeTool.isNullUndefined(type)) {
            sqlQuery.where.type = type;
        }

        if (TypeTool.isNotEmptyString(categoryId)) {
            sqlQuery.include.push({
                model: KeywordRelCategory,
                as: `keyword_rel_category`,
                where: { categoryId },
                required: true,
            })
        }

        if (sortKey && sortACS) {
            sqlQuery.order = [[sortKey, sortACS]];
        }

        sqlQuery = createPaginationQuery(sqlQuery, page, take);

        let keyword = await Keyword.findAll({
            distinct: true,
            ...sqlQuery,
        });

        keyword = { rows: keyword };

        let count = await TableCountService.getTableCountFromRedis(Keyword, sqlQuery);
        if (count === null) {
            count = await Keyword.count({ distinct: true, ...sqlQuery });
            await TableCountService.storeTableCountInRedis(Keyword, sqlQuery, count);
        }
        keyword.count = count;

        return keyword;
    }

    async mergeKeyword(sourceKeywordId, targetKeywordId) {

        const [affectedRows] = await ShotRelKeyword.update({
            keywordId: targetKeywordId
        },
            {
                where: {
                    keywordId: sourceKeywordId,
                }
            }
        )

        return affectedRows > 0

    }

    async getShotsOfKeyword(keywordId, query = {}) {

        const page = query.page || 1
        const take = query.take || 10

        const sqlQueryForCount = `SELECT count(*) over() as total FROM (SELECT * FROM shots AS Shot WHERE ( SELECT shotId FROM shot_keyword AS keywordIds WHERE (keywordIds.keywordId =:keywordId AND keywordIds.shotId = Shot.id ) LIMIT 1 ) IS NOT NULL ) AS Shot INNER JOIN shot_keyword AS keywordIds ON Shot.id = keywordIds.shotId AND keywordIds.keywordId=:keywordId  group by Shot.id limit 1;`
        const sqlQuery = `SELECT  count(Shot.id) as keywordCount, Shot.id as shotId, Shot.title as shotTitle FROM (SELECT * FROM shots AS Shot WHERE ( SELECT Shot.id FROM shot_keyword AS keywordIds WHERE (keywordIds.keywordId =:keywordId AND keywordIds.shotId = Shot.id  ) LIMIT 1 ) IS NOT NULL limit :take offset :offset ) AS Shot INNER JOIN shot_keyword AS keywordIds ON Shot.id = keywordIds.shotId AND keywordIds.keywordId =:keywordId  group by Shot.id ;`

        const replacements = { keywordId, offset: (+page - 1) * +take, take }

        const totalItems = (await sequelize.query(sqlQueryForCount, { replacements, type: QueryTypes.SELECT }));
        const rows = await sequelize.query(sqlQuery, { replacements, type: QueryTypes.SELECT });

        return { count: totalItems?.[0]?.total || 0, rows }
    }

    async detachShotFromKeyword(keywordId, shotId) {

        return await ShotRelKeyword.destroy({
            where: {
                shotId,
                keywordId
            }
        })
    }

    async deleteKeyword(keywordId) {

        return await Keyword.destroy({
            where: {
                id: keywordId
            }
        })
    }

    async getKeywordsByIds(keywordId) {
        const keywords = await Keyword.findAll({ where: { id: keywordId } });
        return keywords;
    }

    async getKeywordDetail(keywordId) {
        let keyword = await this.getById(keywordId);
        keyword = keyword.toJSON();

        if (keyword.type === "event") {
            keyword.event = await KeywordEvent.findOne({ where: { id: keyword.typeId } });
        }
        else if (keyword.type === "location") {
            keyword.location = await KeywordLocation.findOne({ where: { id: keyword.typeId } });
        }

        return keyword
    }

    async createKeyword(data) {
        let {
            keyword,
            type = "normal",
            location = {},
            event = {}
        } = data;

        keyword = keyword.trim();

        const checkKeyword = await Keyword.findOne({ where: { keyword } });
        if (checkKeyword) {
            return checkKeyword;
        }
        else {
            const keywordModel = await Keyword.create({ keyword, type });
            let typeModel = null;
            if (type === 'location') {
                typeModel = await this.createLocationKeyword(location)
            }
            else if (type === 'event') {
                typeModel = await this.createEventKeyword(event)
            }

            if (typeModel) {
                keywordModel.typeId = typeModel.id;
                await keywordModel.save();
            }

            return keywordModel;
        }

    }

    async findOrCreateKeywordArray(keywords) {
        let existKeywords = await this.model.findAll({ where: { keyword: keywords } });
        let onlyExistKeywordArray = [];
        existKeywords = existKeywords.map(item => {
            item = item.toJSON();
            onlyExistKeywordArray.push(item.keyword)
            return {
                id: item.id,
                keyword: item.keyword
            }
        });

        let newKeywords = keywords.filter(keyword => !onlyExistKeywordArray.includes(keyword));
        newKeywords = [...(new Set(newKeywords))].map(keyword => ({ keyword, type: "normal" }))

        let response = await Keyword.bulkCreate(newKeywords);
        response.forEach(item => {
            item = item.toJSON();
            existKeywords.push({
                id: item.id,
                keyword: item.keyword
            })
        })

        return existKeywords;
    }

    async createLocationKeyword(data = {}) {
        let {
            lat = null,
            lng = null,
            cityId = null
        } = data;

        if (!TypeTool.boolean(cityId)) {
            cityId = null;
        }

        if (!TypeTool.boolean(lat)) lat = null
        if (!TypeTool.boolean(lng)) lng = null

        const model = await KeywordLocation.create({ lat, lng, cityId });
        return model;
    }

    async updateLocationKeyword(locId, data = {}) {
        let {
            lat = null,
            lng = null,
            cityId = null
        } = data;

        if (!TypeTool.boolean(cityId)) {
            cityId = null;
        }
        try {
            const model = await KeywordLocation.findOne({ where: { id: locId } });
            model.lat = lat;
            model.lng = lng;
            model.cityId = cityId;
            await model.save();
        }
        catch (err) {
            console.log(err)
            return;
        }
    }

    async deleteLocationKeyword(id) {
        await KeywordLocation.destroy({ where: { id } });
        return true;
    }

    async createEventKeyword(data = {}) {
        const {
            day = null,
            month = null,
            year = null,
            type = null
        } = data;

        const model = await KeywordEvent.create({ type, day, month, year });
        return model;
    }

    async editEventKeyword(eventId, data = {}) {
        const {
            day,
            month,
            year,
            type
        } = data;

        try {
            const model = await KeywordEvent.findOne({ where: { id: eventId } });
            if (day !== undefined) model.day = day;
            if (month !== undefined) model.month = month;
            if (year !== undefined) model.year = year;
            if (type !== undefined) model.type = type;

            await model.save();
        }
        catch (err) {
            console.log(err)
            return;
        }
    }

    async deleteEventKeyword(id) {
        await KeywordEvent.destroy({ where: { id } });
        return true;
    }

    async editKeyword(keywordId, data = {}) {
        const {
            type,
            keyword,
            location = {},
            event = {}
        } = data;

        const keywordModel = await this.getById(keywordId);
        keywordModel.keyword = keyword;

        if (type !== keywordModel.type) {
            let typeModel = null;
            if (type === 'location') {
                typeModel = await this.createLocationKeyword(location);
            }
            else if (type === 'event') {
                typeModel = await this.createEventKeyword(event);
            }

            if (keywordModel.type === 'location') {
                await this.deleteLocationKeyword(keywordModel.typeId);
            }
            else if (keywordModel.type === 'event') {
                await this.deleteEventKeyword(keywordModel.typeId);
            }

            keywordModel.typeId = typeModel?.id ?? null;
            keywordModel.type = type;
        }
        else {
            if (type === 'location') {
                await this.updateLocationKeyword(keywordModel.typeId, location);
            }
            else if (type === 'event') {
                await this.editEventKeyword(keywordModel.typeId, event);
            }
        }

        await keywordModel.save();

        return keywordModel;
    }

    async getKeywordUsageCount(keywordIds) {
        let counts = await ShotRelKeyword.findAll({
            where: { keywordId: keywordIds },
            group: ['keywordId'],
            attributes: ['id', 'keywordId', [Sequelize.fn('count', Sequelize.col('id')), 'count']],
        })

        return counts.map(item => item.toJSON());
    }

    async updateKeywordCategoryId(categoryId, keywordIds) {
        await Keyword.update({ categoryId: null }, { where: { categoryId } });
        await Keyword.update({ categoryId }, { where: { id: keywordIds } });
    }

    async updateKeywordCount(keywordIds) {
        for (let i = 0; i < keywordIds.length; i++) {
            const keyword = await Keyword.findOne({ where: { id: keywordIds[i] } });
            if (!keyword) continue;

            const replacements = { keywordId: keywordIds[i] }

            const sqlQueryForCountOfShot = `SELECT count(*) over() as total FROM (SELECT * FROM shots AS Shot WHERE ( SELECT "shotId" FROM shot_keyword AS "keywordIds" WHERE ("keywordIds"."keywordId" =:keywordId AND "keywordIds"."shotId" = Shot.id ) LIMIT 1 ) IS NOT NULL ) AS Shot INNER JOIN shot_keyword AS "keywordIds" ON Shot.id = "keywordIds"."shotId" AND "keywordIds"."keywordId"=:keywordId  group by Shot.id limit 1;`
            const totalItemShot = (await sequelize.query(sqlQueryForCountOfShot, { replacements, type: QueryTypes.SELECT }));

            const sqlQueryForCountVideoDetail = `SELECT count(*) over() as total FROM (SELECT * FROM video_detail AS VideoDetail WHERE ( SELECT "videoFileId" FROM video_detail_keyword AS keywordIds WHERE (keywordIds."keywordId" =:keywordId AND keywordIds."videoFileId" = VideoDetail."videoFileId" ) LIMIT 1 ) IS NOT NULL ) AS VideoDetail INNER JOIN video_detail_keyword AS keywordIds ON VideoDetail."videoFileId" = keywordIds."videoFileId" AND keywordIds."keywordId"=:keywordId  group by VideoDetail."videoFileId" limit 1;`
            const totalItemVideoDetail = (await sequelize.query(sqlQueryForCountVideoDetail, { replacements, type: QueryTypes.SELECT }));

            keyword.count = (totalItemShot?.[0]?.total ?? 0) + (totalItemVideoDetail?.[0]?.total ?? 0);
            await keyword.save();
        }
    }

    async checkAndUpdateWithUUID(keywords) {
        let newKeywords = [];
        for (let i = 0; i < keywords.length; i++) {
            const checkKeyword = await Keyword.findOne({ where: { UUID: keywords[i].UUID } });
            if (!checkKeyword) {
                let t = await Keyword.create({ keyword: keywords[i].keyword.trim(), UUID: keywords[i].UUID });
                newKeywords.push(t.toJSON());
            } else {
                if (checkKeyword.keyword !== keywords[i].keyword) {
                    checkKeyword.keyword = keywords[i].keyword;
                    await checkKeyword.save();
                }
                newKeywords.push(checkKeyword.toJSON());
            }
        }

        return newKeywords;
    }
}

module.exports = new KeywordService();
