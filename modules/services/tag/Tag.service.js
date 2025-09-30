
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const QueryTypes = Sequelize.QueryTypes;

const TypeTool = require("../../../helper/type.tool");
const { Tag, TagRelCategory, CategoryTag, TagLocation, TagEvent, ShotRelTag, sequelize } = require("../../_default/model");
const { createPaginationQuery } = require('../../../helper/SqlHelper.tool');
const TableCountService = require('../tableCount/TableCount.service');

const fetch = async (filters = {}) => {
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
        sqlQuery.where.tag = { [Op.like]: `%${search}%` };
    }

    if (!!excludeId) sqlQuery.where.id = { [Op.not]: excludeId };

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

    if (sortKey && sortACS) {
        sqlQuery.order = [[sortKey, sortACS]];
    }

    sqlQuery = createPaginationQuery(sqlQuery, page, take);

    let tags = await Tag.findAll({
        distinct: true,
        ...sqlQuery,
    });

    tags = { rows: tags };

    let count = await TableCountService.getTableCountFromRedis(Tag, sqlQuery);
    if (count === null) {
        count = await Tag.count({ distinct: true, ...sqlQuery });
        await TableCountService.storeTableCountInRedis(Tag, sqlQuery, count);
    }
    tags.count = count;

    return tags;
};

const combine = async (sourceTagId, targetTagId) => {
    const [affectedRows] = await ShotRelTag.update({
        tagId: targetTagId
    }, {
        where: {
            tagId: sourceTagId,
        }
    });

    return affectedRows > 0;
};

const fetchShots = async (tagId, query = {}) => {
    const page = query.page || 1;
    const take = query.take || 10;

    const sqlQueryForCount = `SELECT count(*) over() as total FROM (SELECT * FROM shots AS Shot WHERE ( SELECT shotId FROM shot_tag AS tagIds WHERE (tagIds.tagId =:tagId AND tagIds.shotId = Shot.id ) LIMIT 1 ) IS NOT NULL ) AS Shot INNER JOIN shot_tag AS tagIds ON Shot.id = tagIds.shotId AND tagIds.tagId=:tagId  group by Shot.id limit 1;`;
    const sqlQuery = `SELECT  count(Shot.id) as tagCount, Shot.id as shotId, Shot.title as shotTitle FROM (SELECT * FROM shots AS Shot WHERE ( SELECT Shot.id FROM shot_tag AS tagIds WHERE (tagIds.tagId =:tagId AND tagIds.shotId = Shot.id  ) LIMIT 1 ) IS NOT NULL limit :take offset :offset ) AS Shot INNER JOIN shot_tag AS tagIds ON Shot.id = tagIds.shotId AND tagIds.tagId =:tagId  group by Shot.id ;`;

    const replacements = { tagId, offset: (+page - 1) * +take, take };

    const totalItems = (await sequelize.query(sqlQueryForCount, { replacements, type: QueryTypes.SELECT }));
    const rows = await sequelize.query(sqlQuery, { replacements, type: QueryTypes.SELECT });

    return { count: totalItems?.[0]?.total || 0, rows };
};

const unlinkShot = async (tagId, shotId) => {
    return await ShotRelTag.destroy({
        where: {
            shotId,
            tagId
        }
    });
};

const remove = async (tagId) => {
    return await Tag.destroy({
        where: {
            id: tagId
        }
    });
};

const fetchByIds = async (tagIds) => {
    const tags = await Tag.findAll({ where: { id: tagIds } });
    return tags;
};

const fetchDetails = async (tagId) => {
    let tag = await Tag.findByPk(tagId);
    if (!tag) return null;

    tag = tag.toJSON();

    if (tag.type === "event") {
        tag.event = await TagEvent.findOne({ where: { id: tag.typeId } });
    } else if (tag.type === "location") {
        tag.location = await TagLocation.findOne({ where: { id: tag.typeId } });
    }

    return tag;
};

const addLocation = async (data = {}) => {
    let {
        lat = null,
        lng = null,
        cityId = null
    } = data;

    if (!TypeTool.boolean(cityId)) {
        cityId = null;
    }

    if (!TypeTool.boolean(lat)) lat = null;
    if (!TypeTool.boolean(lng)) lng = null;

    const model = await TagLocation.create({ lat, lng, cityId });
    return model;
};

const addEvent = async (data = {}) => {
    const {
        day = null,
        month = null,
        year = null,
        type = null
    } = data;

    const model = await TagEvent.create({ type, day, month, year });
    return model;
};

const add = async (data) => {
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
    } else {
        const tagModel = await Tag.create({ tag, type });
        let typeModel = null;
        if (type === 'location') {
            typeModel = await addLocation(location);
        } else if (type === 'event') {
            typeModel = await addEvent(event);
        }

        if (typeModel) {
            tagModel.typeId = typeModel.id;
            await tagModel.save();
        }

        return tagModel;
    }
};

const findOrCreate = async (tags) => {
    let existTags = await Tag.findAll({ where: { tag: tags } });
    let onlyExistTagArray = [];
    existTags = existTags.map(item => {
        item = item.toJSON();
        onlyExistTagArray.push(item.tag);
        return {
            id: item.id,
            tag: item.tag
        };
    });

    let newTags = tags.filter(tag => !onlyExistTagArray.includes(tag));
    newTags = [...(new Set(newTags))].map(tag => ({ tag, type: "normal" }));

    let response = await Tag.bulkCreate(newTags);
    response.forEach(item => {
        item = item.toJSON();
        existTags.push({
            id: item.id,
            tag: item.tag
        });
    });

    return existTags;
};

const updateLocationDetails = async (locId, data = {}) => {
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
    } catch (err) {
        console.log(err);
        return;
    }
};

const removeLocation = async (id) => {
    await TagLocation.destroy({ where: { id } });
    return true;
};

const updateEventDetails = async (eventId, data = {}) => {
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
    } catch (err) {
        console.log(err);
        return;
    }
};

const removeEvent = async (id) => {
    await TagEvent.destroy({ where: { id } });
    return true;
};

const update = async (tagId, data = {}) => {
    const {
        type,
        tag,
        location = {},
        event = {}
    } = data;

    const tagModel = await Tag.findByPk(tagId);
    if (!tagModel) {
        throw new Error("Tag not found");
    }
    tagModel.tag = tag;

    if (type !== tagModel.type) {
        let typeModel = null;
        if (type === 'location') {
            typeModel = await addLocation(location);
        } else if (type === 'event') {
            typeModel = await addEvent(event);
        }

        if (tagModel.type === 'location') {
            await removeLocation(tagModel.typeId);
        } else if (tagModel.type === 'event') {
            await removeEvent(tagModel.typeId);
        }

        tagModel.typeId = typeModel?.id ?? null;
        tagModel.type = type;
    } else {
        if (type === 'location') {
            await updateLocationDetails(tagModel.typeId, location);
        } else if (type === 'event') {
            await updateEventDetails(tagModel.typeId, event);
        }
    }

    await tagModel.save();

    return tagModel;
};

const fetchUsageCount = async (tagIds) => {
    let counts = await ShotRelTag.findAll({
        where: { tagId: tagIds },
        group: ['tagId'],
        attributes: ['id', 'tagId', [Sequelize.fn('count', Sequelize.col('id')), 'count']],
    });

    return counts.map(item => item.toJSON());
};

const updateCategory = async (categoryId, tagIds) => {
    await Tag.update({ categoryId: null }, { where: { categoryId } });
    await Tag.update({ categoryId }, { where: { id: tagIds } });
};

const recalculateCount = async (tagIds) => {
    for (let i = 0; i < tagIds.length; i++) {
        const tag = await Tag.findOne({ where: { id: tagIds[i] } });
        if (!tag) continue;

        const replacements = { tagId: tagIds[i] };

        const sqlQueryForCountOfShot = `SELECT count(*) over() as total FROM (SELECT * FROM shots AS Shot WHERE ( SELECT "shotId" FROM shot_tag AS "tagIds" WHERE ("tagIds"."tagId" =:tagId AND "tagIds"."shotId" = Shot.id ) LIMIT 1 ) IS NOT NULL ) AS Shot INNER JOIN shot_tag AS "tagIds" ON Shot.id = "tagIds"."shotId" AND "tagIds"."tagId"=:tagId  group by Shot.id limit 1;`;
        const totalItemShot = (await sequelize.query(sqlQueryForCountOfShot, { replacements, type: QueryTypes.SELECT }));

        const sqlQueryForCountVideoDetail = `SELECT count(*) over() as total FROM (SELECT * FROM video_detail AS VideoDetail WHERE ( SELECT "videoFileId" FROM video_detail_tag AS tagIds WHERE (tagIds."tagId" =:tagId AND tagIds."videoFileId" = VideoDetail."videoFileId" ) LIMIT 1 ) IS NOT NULL ) AS VideoDetail INNER JOIN video_detail_tag AS tagIds ON VideoDetail."videoFileId" = tagIds."videoFileId" AND tagIds."tagId"=:tagId  group by VideoDetail."videoFileId" limit 1;`;
        const totalItemVideoDetail = (await sequelize.query(sqlQueryForCountVideoDetail, { replacements, type: QueryTypes.SELECT }));

        tag.count = (totalItemShot?.[0]?.total ?? 0) + (totalItemVideoDetail?.[0]?.total ?? 0);
        await tag.save();
    }
};

const syncWithUUID = async (tags) => {
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
};

module.exports = {
    fetch,
    combine,
    fetchShots,
    unlinkShot,
    remove,
    fetchByIds,
    fetchDetails,
    add,
    findOrCreate,
    addLocation,
    updateLocationDetails,
    removeLocation,
    addEvent,
    updateEventDetails,
    removeEvent,
    update,
    fetchUsageCount,
    updateCategory,
    recalculateCount,
    syncWithUUID
};
