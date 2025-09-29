const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const QueryTypes = Sequelize.QueryTypes

const TypeTool = require("../../../helper/type.tool");
const Service = require("../../_default/service");
const { Tag, TagRelCategory, CategoryTag, TagLocation, TagEvent, ShotRelTag, sequelize } = require("../../_default/model");
const { createPaginationQuery } = require('../../../helper/SqlHelper.tool');
const TableCountService = require('../tableCount/TableCount.service');

class TagService extends Service {

    constructor() {
        super(Tag)
    }

    async getTags(filters = {}) {

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
            sqlQuery.where.tag = { [Op.like]: `%${search}%` }
        }

        if (!!excludeId) sqlQuery.where.id = { [Op.not]: excludeId }

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

        if (sortKey && sortACS) {
            sqlQuery.order = [[sortKey, sortACS]];
        }

        sqlQuery = createPaginationQuery(sqlQuery, page, take);

        let tag = await Tag.findAll({
            distinct: true,
            ...sqlQuery,
        });

        tag = { rows: tag };

        let count = await TableCountService.getTableCountFromRedis(Tag, sqlQuery);
        if (count === null) {
            count = await Tag.count({ distinct: true, ...sqlQuery });
            await TableCountService.storeTableCountInRedis(Tag, sqlQuery, count);
        }
        tag.count = count;

        return tag;
    }

    async mergeTag(sourceTagId, targetTagId) {

        const [affectedRows] = await ShotRelTag.update({
            tagId: targetTagId
        },
            {
                where: {
                    tagId: sourceTagId,
                }
            }
        )

        return affectedRows > 0

    }

    async getShotsOfTag(tagId, query = {}) {

        const page = query.page || 1
        const take = query.take || 10

        const sqlQueryForCount = `SELECT count(*) over() as total FROM (SELECT * FROM shots AS Shot WHERE ( SELECT shotId FROM shot_tag AS tagIds WHERE (tagIds.tagId =:tagId AND tagIds.shotId = Shot.id ) LIMIT 1 ) IS NOT NULL ) AS Shot INNER JOIN shot_tag AS tagIds ON Shot.id = tagIds.shotId AND tagIds.tagId=:tagId  group by Shot.id limit 1;`
        const sqlQuery = `SELECT  count(Shot.id) as tagCount, Shot.id as shotId, Shot.title as shotTitle FROM (SELECT * FROM shots AS Shot WHERE ( SELECT Shot.id FROM shot_tag AS tagIds WHERE (tagIds.tagId =:tagId AND tagIds.shotId = Shot.id  ) LIMIT 1 ) IS NOT NULL limit :take offset :offset ) AS Shot INNER JOIN shot_tag AS tagIds ON Shot.id = tagIds.shotId AND tagIds.tagId =:tagId  group by Shot.id ;`

        const replacements = { tagId, offset: (+page - 1) * +take, take }

        const totalItems = (await sequelize.query(sqlQueryForCount, { replacements, type: QueryTypes.SELECT }));
        const rows = await sequelize.query(sqlQuery, { replacements, type: QueryTypes.SELECT });

        return { count: totalItems?.[0]?.total || 0, rows }
    }

    async detachShotFromTag(tagId, shotId) {

        return await ShotRelTag.destroy({
            where: {
                shotId,
                tagId
            }
        })
    }

    async deleteTag(tagId) {

        return await Tag.destroy({
            where: {
                id: tagId
            }
        })
    }

    async getTagsByIds(tagId) {
        const tags = await Tag.findAll({ where: { id: tagId } });
        return tags;
    }

    async getTagDetail(tagId) {
        let tag = await this.getById(tagId);
        tag = tag.toJSON();

        if (tag.type === "event") {
            tag.event = await TagEvent.findOne({ where: { id: tag.typeId } });
        }
        else if (tag.type === "location") {
            tag.location = await TagLocation.findOne({ where: { id: tag.typeId } });
        }

        return tag
    }

    async createTag(data) {
        let {
            tag,
            type = "normal",
            location = {},
            event = {}
        } = data;

        tag = tag.trim();

        const checkTag = await Tag.findOne({ where: { tag } });
        if (checkTag) {
            return checkTag;
        }
        else {
            const tagModel = await Tag.create({ tag, type });
            let typeModel = null;
            if (type === 'location') {
                typeModel = await this.createLocationTag(location)
            }
            else if (type === 'event') {
                typeModel = await this.createEventTag(event)
            }

            if (typeModel) {
                tagModel.typeId = typeModel.id;
                await tagModel.save();
            }

            return tagModel;
        }

    }

    async findOrCreateTagArray(tags) {
        let existTags = await this.model.findAll({ where: { tag: tags } });
        let onlyExistTagArray = [];
        existTags = existTags.map(item => {
            item = item.toJSON();
            onlyExistTagArray.push(item.tag)
            return {
                id: item.id,
                tag: item.tag
            }
        });

        let newTags = tags.filter(tag => !onlyExistTagArray.includes(tag));
        newTags = [...(new Set(newTags))].map(tag => ({ tag, type: "normal" }))

        let response = await Tag.bulkCreate(newTags);
        response.forEach(item => {
            item = item.toJSON();
            existTags.push({
                id: item.id,
                tag: item.tag
            })
        })

        return existTags;
    }

    async createLocationTag(data = {}) {
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

        const model = await TagLocation.create({ lat, lng, cityId });
        return model;
    }

    async updateLocationTag(locId, data = {}) {
        let {
            lat = null,
            lng = null,
            cityId = null
        } = data;

        if (!TypeTool.boolean(cityId)) {
            cityId = null;
        }
        try {
            const model = await TagLocation.findOne({ where: { id: locId } });
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

    async deleteLocationTag(id) {
        await TagLocation.destroy({ where: { id } });
        return true;
    }

    async createEventTag(data = {}) {
        const {
            day = null,
            month = null,
            year = null,
            type = null
        } = data;

        const model = await TagEvent.create({ type, day, month, year });
        return model;
    }

    async editEventTag(eventId, data = {}) {
        const {
            day,
            month,
            year,
            type
        } = data;

        try {
            const model = await TagEvent.findOne({ where: { id: eventId } });
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

    async deleteEventTag(id) {
        await TagEvent.destroy({ where: { id } });
        return true;
    }

    async editTag(tagId, data = {}) {
        const {
            type,
            tag,
            location = {},
            event = {}
        } = data;

        const tagModel = await this.getById(tagId);
        tagModel.tag = tag;

        if (type !== tagModel.type) {
            let typeModel = null;
            if (type === 'location') {
                typeModel = await this.createLocationTag(location);
            }
            else if (type === 'event') {
                typeModel = await this.createEventTag(event);
            }

            if (tagModel.type === 'location') {
                await this.deleteLocationTag(tagModel.typeId);
            }
            else if (tagModel.type === 'event') {
                await this.deleteEventTag(tagModel.typeId);
            }

            tagModel.typeId = typeModel?.id ?? null;
            tagModel.type = type;
        }
        else {
            if (type === 'location') {
                await this.updateLocationTag(tagModel.typeId, location);
            }
            else if (type === 'event') {
                await this.editEventTag(tagModel.typeId, event);
            }
        }

        await tagModel.save();

        return tagModel;
    }

    async getTagUsageCount(tagIds) {
        let counts = await ShotRelTag.findAll({
            where: { tagId: tagIds },
            group: ['tagId'],
            attributes: ['id', 'tagId', [Sequelize.fn('count', Sequelize.col('id')), 'count']],
        })

        return counts.map(item => item.toJSON());
    }

    async updateTagCategoryId(categoryId, tagIds) {
        await Tag.update({ categoryId: null }, { where: { categoryId } });
        await Tag.update({ categoryId }, { where: { id: tagIds } });
    }

    async updateTagCount(tagIds) {
        for (let i = 0; i < tagIds.length; i++) {
            const tag = await Tag.findOne({ where: { id: tagIds[i] } });
            if (!tag) continue;

            const replacements = { tagId: tagIds[i] }

            const sqlQueryForCountOfShot = `SELECT count(*) over() as total FROM (SELECT * FROM shots AS Shot WHERE ( SELECT "shotId" FROM shot_tag AS "tagIds" WHERE ("tagIds"."tagId" =:tagId AND "tagIds"."shotId" = Shot.id ) LIMIT 1 ) IS NOT NULL ) AS Shot INNER JOIN shot_tag AS "tagIds" ON Shot.id = "tagIds"."shotId" AND "tagIds"."tagId"=:tagId  group by Shot.id limit 1;`
            const totalItemShot = (await sequelize.query(sqlQueryForCountOfShot, { replacements, type: QueryTypes.SELECT }));

            const sqlQueryForCountVideoDetail = `SELECT count(*) over() as total FROM (SELECT * FROM video_detail AS VideoDetail WHERE ( SELECT "videoFileId" FROM video_detail_tag AS tagIds WHERE (tagIds."tagId" =:tagId AND tagIds."videoFileId" = VideoDetail."videoFileId" ) LIMIT 1 ) IS NOT NULL ) AS VideoDetail INNER JOIN video_detail_tag AS tagIds ON VideoDetail."videoFileId" = tagIds."videoFileId" AND tagIds."tagId"=:tagId  group by VideoDetail."videoFileId" limit 1;`
            const totalItemVideoDetail = (await sequelize.query(sqlQueryForCountVideoDetail, { replacements, type: QueryTypes.SELECT }));

            tag.count = (totalItemShot?.[0]?.total ?? 0) + (totalItemVideoDetail?.[0]?.total ?? 0);
            await tag.save();
        }
    }

    async checkAndUpdateWithUUID(tags) {
        let newTags = [];
        for (let i = 0; i < tags.length; i++) {
            const checkTag = await Tag.findOne({ where: { UUID: tags[i].UUID } });
            if (!checkTag) {
                let t = await Tag.create({ tag: tags[i].tag.trim(), UUID: tags[i].UUID });
                newTags.push(t.toJSON());
            } else {
                if (checkTag.tag !== tags[i].tag) {
                    checkTag.tag = tags[i].tag;
                    await checkTag.save();
                }
                newTags.push(checkTag.toJSON());
            }
        }

        return newTags;
    }
}

module.exports = new TagService();
