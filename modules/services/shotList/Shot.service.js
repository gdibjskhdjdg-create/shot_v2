const path = require('path');
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const {
    Shot,
    User,
    ShotRelCategory,
    Category,
    ShotRelTag,
    VideoFile,
    Project,
    ShotRelLanguage,
    ExportVideoDetail,
    ExportVideoFile
} = require("../../_default/model");

const TypeTool = require("../../../helper/type.tool");
const { createPaginationQuery } = require("../../../helper/SqlHelper.tool");
const ErrorResult = require('../../../helper/error.tool');
const emitter = require('../../_default/eventEmitter');
const { takeScreenShot } = require('../../services/FFmpeg/FFmpeg.service');
const GalleryParser = require('../../../helper/galleryParser.tool');
const TableCountService = require('../tableCount/TableCount.service');
const LanguageService = require("../language/Language.service");
const CategoryService = require("../category/Category.service");
const ShotDefaultValueService = require('./ShotDefaultValue.service');
const OwnerService = require('../owner/Owner.service');
const ShotInputService = require('./ShotInput.service');
const TagService = require('../tag/Tag.service');
const VideoFileService = require('../videoFile/VideoFile.service');

const pathToRoot = path.join(__dirname, '..', '..', '..');

// Internal helper functions
const _getTagsForShots = async (shotIds) => {
    const relTags = await ShotRelTag.findAll({ where: { shotId: shotIds } });
    const tagIds = [...new Set(relTags.map(item => item.tagId))];
    if (tagIds.length === 0) return {};

    const tags = await TagService.fetchByIds(tagIds);
    const tagsMap = tags.reduce((acc, tag) => {
        acc[tag.id] = tag.toJSON();
        return acc;
    }, {});

    const shotsTags = {};
    for (const rel of relTags) {
        if (!shotsTags[rel.shotId]) {
            shotsTags[rel.shotId] = [];
        }
        const tag = tagsMap[rel.tagId];
        if (tag) {
            shotsTags[rel.shotId].push({ ...tag, ShotRelTag: rel.toJSON() });
        }
    }
    return shotsTags;
};

const _updateShotGallery = async (shot, data) => {
    const { imgGallery } = data;
    if (!imgGallery) return;

    const newTimes = (imgGallery || []).map(item => item.time);
    const oldGallery = shot.gallery ? JSON.parse(shot.gallery) : [];
    const oldTimes = oldGallery.map(item => item.time);

    const timesToCreate = newTimes.filter(time => !oldTimes.includes(time));
    const imagesToRemove = oldGallery.filter(item => !newTimes.includes(item.time));
    const existingImages = oldGallery.filter(item => newTimes.includes(item.time));

    const video = await VideoFileService.getById(shot.videoFileId);
    if (!video) return;

    const galleryPath = path.join("gallery", shot.id.toString());
    const pathToStoreImg = path.join(pathToRoot, appConfigs.STORE_FOLDER_FROM_APP_ROOT, galleryPath);

    if (timesToCreate.length > 0) {
        if (!fs.existsSync(pathToStoreImg)) {
            fs.mkdirSync(pathToStoreImg, { recursive: true });
        }
        const newFiles = await takeScreenShot(`${video.path}/${video.name}`, pathToStoreImg, timesToCreate);
        existingImages.push(...newFiles.map(item => ({ ...item, path: galleryPath })));
    }

    imagesToRemove.forEach(img => {
        try {
            fs.unlinkSync(path.join(pathToRoot, img.path, img.fileName));
        } catch (err) {
            console.error(`Failed to delete gallery image: ${err.message}`);
        }
    });

    const mainImgIndex = Math.max(0, (imgGallery || []).findIndex(item => item.mainImg));
    const newGalleryArr = existingImages.map((item, index) => ({
        ...item,
        mainImg: mainImgIndex === index
    }));

    shot.gallery = JSON.stringify(newGalleryArr);
    await shot.save();
};

const _updateShotLanguages = async (shot, data) => {
    const languageTypes = [
        { key: "mainLanguage", inShot: "hasMainLang" },
        { key: "dubbed", inShot: "hasDubbed" },
        { key: "subtitle", inShot: "hasSubtitle" },
        { key: "narration", inShot: "hasNarration" },
    ];

    let needsSave = false;
    for (const type of languageTypes) {
        const languageIds = data[type.key];
        if (Array.isArray(languageIds)) {
            await ShotRelLanguage.destroy({ where: { shotId: shot.id, type: type.key } });
            if (languageIds.includes(0) || languageIds.includes('0')) {
                shot[type.inShot] = null;
            } else {
                shot[type.inShot] = languageIds.length > 0;
                if (languageIds.length > 0) {
                    const dataToInsert = languageIds.map(id => ({ shotId: shot.id, languageId: id, type: type.key }));
                    await ShotRelLanguage.bulkCreate(dataToInsert);
                }
            }
            needsSave = true;
        }
    }
    if (needsSave) await shot.save();
};

const _updateShotCategories = async (shotId, data) => {
    const { categoriesId } = data;
    if (Array.isArray(categoriesId)) {
        await ShotRelCategory.destroy({ where: { shotId } });
        if (categoriesId.length > 0) {
            await ShotRelCategory.bulkCreate(categoriesId.map(categoryId => ({ shotId, categoryId })));
        }
    }
};

const _updateShotTags = async (shotId, data) => {
    const { tagInput } = data;
    if (!Array.isArray(tagInput)) return;

    const inputIds = tagInput.map(item => item.inputId);
    const removedTags = await ShotRelTag.findAll({ where: { shotId, inputId: inputIds, inVideo: 0 } });
    await ShotRelTag.destroy({ where: { shotId, inputId: inputIds, inVideo: 0 } });

    let bulkData = [];
    let newTagNames = [];
    tagInput.forEach(item => {
        item.tagIds.forEach(tagIdOrName => {
            const isNew = !parseInt(tagIdOrName);
            if (isNew) newTagNames.push(tagIdOrName);
            bulkData.push({ shotId, tagId: tagIdOrName, inputId: item.inputId, inVideo: 0, isNew });
        });
    });

    if (newTagNames.length > 0) {
        const createdTags = await TagService.findOrCreate(newTagNames);
        bulkData = bulkData.map(item => {
            if (item.isNew) {
                const found = createdTags.find(t => t.tag === item.tagId);
                if (found) item.tagId = found.id;
            }
            return item;
        });
    }

    const validBulkData = bulkData.filter(item => item.tagId).map(({ isNew, ...rest }) => rest);
    if (validBulkData.length > 0) {
        await ShotRelTag.bulkCreate(validBulkData);
    }
    
    const changedTagIds = [
        ...new Set([...removedTags.map(t => t.tagId), ...validBulkData.map(t => t.tagId)])
    ];
    if (changedTagIds.length > 0) {
        await TagService.recalculateCount(changedTagIds);
    }
};

const _updateShotInVideoTags = async (shotId, data) => {
    const { tagInVideo } = data;
    if (!Array.isArray(tagInVideo)) return;

    await ShotRelTag.destroy({ where: { shotId, inputId: null, inVideo: 1 } });

    let bulkData = [];
    let newTagNames = [];
    tagInVideo.forEach(item => {
        const isNew = !parseInt(item.tagId);
        if (isNew) newTagNames.push(item.tagId);
        bulkData.push({
            isNew,
            shotId,
            tagId: item.tagId,
            inVideo: 1,
            otherInfo: JSON.stringify({ times: item.times })
        });
    });

    if (newTagNames.length > 0) {
        const newTagsEntity = await TagService.findOrCreate(newTagNames);
        bulkData = bulkData.map(item => {
            if (item.isNew) {
                const found = newTagsEntity.find(t => t.tag === item.tagId);
                if (found) item.tagId = found.id;
            }
            return item;
        });
    }
    
    const validBulkData = bulkData.filter(item => item.tagId).map(({ isNew, ...rest }) => rest);
    if (validBulkData.length > 0) {
        await ShotRelTag.bulkCreate(validBulkData);
    }
};

const _createShotDefaultValues = async (data) => {
    const keys = ["frameRate", "frameWidth", "frameHeight", "aspectRatio", "format"];
    for (const section of keys) {
        if (data[section]) {
            await ShotDefaultValueService.checkAndCreateDefaultValue({
                section,
                key: data[section],
                value: data[section]
            });
        }
    }
};

const _updateShotRelations = async (shot, params) => {
    await _createShotDefaultValues(params);
    await _updateShotCategories(shot.id, params);
    await _updateShotInVideoTags(shot.id, params);
    await _updateShotTags(shot.id, params);
    await _updateShotLanguages(shot, params);
    await _updateShotGallery(shot, params);
};


// Public functions
const getShotFormBasicInfo = async () => {
    const [languages, owners, categories, defaultValue, inputs] = await Promise.all([
        LanguageService.get(),
        OwnerService.get(),
        CategoryService.get(),
        ShotDefaultValueService.getDefaultValues(),
        ShotInputService.get()
    ]);

    return {
        languages,
        categories,
        owners,
        inputs: inputs.filter(item => item.valuesFrom === "tag"),
        defaultValue
    };
};

const getShotsExportInfo = async ({ shots: shotsId, isExcludeMode, filters = {} }) => {
    let shots;
    if (isExcludeMode) {
        shots = (await listSpecialShots({ ...filters, excludesId: shotsId, page: 1, take: null })).shots;
    } else {
        shots = await Shot.findAll({
            where: { id: shotsId },
            include: [{ model: VideoFile, attributes: ['id', 'size', 'duration'], as: 'videoFile' }]
        });
    }

    const result = { shotDuration: 0, videoSize: 0, videoDuration: 0 };
    const tempVideosId = new Set();

    for (const shot of shots) {
        const { endTime, startTime, videoFile } = shot.toJSON();
        result.shotDuration += (+endTime - +startTime);
        if (videoFile && !tempVideosId.has(videoFile.id)) {
            result.videoSize += videoFile.size ? +videoFile.size : 0;
            result.videoDuration += videoFile.duration ? +videoFile.duration : 0;
            tempVideosId.add(videoFile.id);
        }
    }
    return result;
};

const listShots = async (filters = {}) => {
    const { page, take, search, id, status, userId, projectId, videoFileId, withCheckStudio = true } = filters;

    let sqlQuery = { where: {} };

    if (id) sqlQuery.where.id = id;
    if (status) sqlQuery.where.status = status;
    if (search) sqlQuery.where.title = { [Op.like]: `%${search.trim()}%` };
    if (userId) sqlQuery.where.userId = userId;
    if (videoFileId) sqlQuery.where.videoFileId = videoFileId;
    if (projectId) sqlQuery.where.projectId = projectId;

    sqlQuery = createPaginationQuery(sqlQuery, page, take);
    sqlQuery.include = [
        { model: VideoFile, attributes: ['id', 'originalName', 'originalPath'], as: 'videoFile' },
        { model: User, attributes: ['id', 'fullName'], as: 'user' },
        { model: Project, attributes: ['id', 'title'], as: 'project' }
    ];
    if (withCheckStudio) {
        sqlQuery.include.push({
            model: ExportVideoDetail,
            attributes: ["exportId"],
            as: 'export',
            include: [{ model: ExportVideoFile, attributes: ["productId"], as: "export" }]
        });
    }

    sqlQuery.order = [['updatedAt', 'DESC'], ['id', 'DESC']];

    const shots = await Shot.findAll({ distinct: true, ...sqlQuery });
    const count = await TableCountService.count(Shot, sqlQuery);

    return { shots, count };
};

const getShotStatusesByVideoFile = async (videoFileId) => {
    const shots = await Shot.findAll({
        where: { videoFileId },
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('status')), 'status']]
    });
    return shots.map(x => x.status);
};

const getShotsByIds = async (id = []) => {
    if (!id || id.length === 0) return [];
    return Shot.findAll({ where: { id } });
};

const listSpecialShots = async (filters = {}) => {
    const {
        page, take, search, id, excludesId, ownerId, categoryId, tagId,
        inputIds = [], tagInVideo = false, hasLastEqualizeLogId, pictureDescription,
        withCheckStudio = true, ...otherFilters
    } = filters;

    const currentSearch = [
        "userId", "videoFileId", "startDate", "hasCameraShake", "hasLogo", "hasMusic", "isArchive",
        "projectId", "soundQuality", "color", "pictureEnvironment", "soundQuality", "ageRangeDefaultValueId",
        "dayNight", "qualityGrade", "pictureViewId", "pictureModeId", "pictureTypeId", "gender"
    ];
    const languageSearchKey = ["mainLanguage", "dubbed", "subtitle", "narration"];

    let sqlQuery = {
        where: {},
        order: [['updatedAt', 'DESC']],
        include: [
            { model: VideoFile, attributes: ['id', 'size', 'duration', 'originalName', 'originalPath'], as: 'videoFile' },
            { model: User, attributes: ['id', 'fullName'], as: 'user' },
            { model: Project, attributes: ['id', 'title'], as: 'project' }
        ]
    };

    if (id) sqlQuery.where.id = id;
    if (ownerId) sqlQuery.where.ownerId = ownerId;
    if (excludesId) sqlQuery.where.id = { [Op.notIn]: excludesId };
    if (search) sqlQuery.where.title = { [Op.like]: `%${search.trim()}%` };
    if (pictureDescription) sqlQuery.where.pictureDescription = { [Op.like]: `%${pictureDescription.trim()}%` };
    if (!TypeTool.isNullUndefined(hasLastEqualizeLogId)) {
        sqlQuery.where.lastEqualizeLogId = hasLastEqualizeLogId == 1 ? { [Op.not]: null } : null;
    }

    currentSearch.forEach(key => {
        if (!TypeTool.isNullUndefined(otherFilters[key]) && otherFilters[key] !== '') {
            sqlQuery.where[key] = otherFilters[key];
        }
    });

    const langFilters = languageSearchKey.filter(key => !TypeTool.isNullUndefined(otherFilters[key]));
    if (langFilters.length > 0) {
        sqlQuery.include.push({
            model: ShotRelLanguage,
            as: `languageIds`,
            where: {
                [Op.or]: langFilters.map(key => ({ type: key, languageId: otherFilters[key] }))
            },
            required: true,
        });
    }

    if (categoryId) {
        sqlQuery.include.push({
            model: ShotRelCategory,
            where: { categoryId },
            as: 'categories',
            required: true
        });
    }

    if (tagId) {
        const whereInTag = { tagId, inVideo: TypeTool.boolean2Int(tagInVideo) };
        if (Array.isArray(inputIds) && inputIds.length > 0) whereInTag.inputId = inputIds;
        sqlQuery.include.push({ model: ShotRelTag, where: whereInTag, as: 'tags', required: true });
    }

    if (withCheckStudio) {
        sqlQuery.include.push({
            model: ExportVideoDetail,
            attributes: ["exportId"],
            as: 'export',
            include: [{ model: ExportVideoFile, attributes: ["productId"], as: "export" }]
        });
    }

    sqlQuery = createPaginationQuery(sqlQuery, page, take);
    const shots = await Shot.findAll({ distinct: true, ...sqlQuery });
    const count = await TableCountService.count(Shot, sqlQuery);

    return { shots, count };
};


const checkUserAccessToShot = async (id, userId) => {
    return Shot.findOne({ where: { id, userId } });
};

const getShotDetails = async (id) => {
    const shot = await Shot.findOne({
        where: { id },
        include: [
            { model: Category, attributes: ['id', 'name'], as: 'category' },
            { model: Project, as: "project", attributes: ['id', 'title'] },
            { model: VideoFile, as: 'videoFile' },
        ],
    });

    if (!shot) throw ErrorResult.notFound();

    const response = shot.toJSON();
    response.videoFileUrl = response.videoFileId ? VideoFileService.getVideoFileURL(response.videoFileId) : null;
    if (response.startDate) response.startDate = TypeTool.timestampToJalaliDate(+response.startDate);
    if (response.endDate) response.endDate = TypeTool.timestampToJalaliDate(+response.endDate);

    const [relLanguage, tags] = await Promise.all([
        ShotRelLanguage.findAll({ where: { shotId: id } }),
        _getTagsForShots([id])
    ]);
    
    response.languageIds = relLanguage.map(item => item.toJSON());
    response.allTags = tags[id] || [];
    response.gallery = GalleryParser(response.gallery);
    delete response.tagIds;

    return response;
};

const getShotsDetails = async (ids = []) => {
    if (ids.length === 0) return [];
    
    const items = await Shot.findAll({
        where: { id: ids },
        include: [
            { model: Category, attributes: ['id', 'name'], as: 'category' },
            { model: Project, as: "project", attributes: ['id', 'title'] },
            { model: VideoFile, as: 'videoFile' },
        ],
    });

    if (items.length === 0) throw ErrorResult.notFound();

    const allTags = await _getTagsForShots(ids);
    const allLangs = await ShotRelLanguage.findAll({ where: { shotId: ids } });

    return items.map(shot => {
        const response = shot.toJSON();
        response.videoFileUrl = response.videoFileId ? VideoFileService.getVideoFileURL(response.videoFileId) : null;
        if (response.startDate) response.startDate = TypeTool.timestampToJalaliDate(+response.startDate);
        if (response.endDate) response.endDate = TypeTool.timestampToJalaliDate(+response.endDate);
        
        response.languageIds = allLangs.filter(l => l.shotId === response.id).map(item => item.toJSON());
        response.allTags = allTags[response.id] || [];
        response.gallery = GalleryParser(response.gallery);
        delete response.tagIds;
        return response;
    });
};


const listShotsByVideoFile = async (videoFileId, query = {}) => {
    const where = { videoFileId };
    if (query.shotStatus) where.status = query.shotStatus;
    
    const shots = await Shot.findAll({ where, attributes: ['id', 'status', 'title', 'startTime', 'endTime', 'lastEqualizeLogId'] });
    if (shots.length === 0) return [];
    
    const shotIds = shots.map(s => s.id);
    const tags = await _getTagsForShots(shotIds);

    return shots.map(shot => {
        const res = shot.toJSON();
        const allTags = tags[res.id] || [];
        res.allTags = allTags.filter(tag => !tag.ShotRelTag.inVideo);
        res.inVideoTags = allTags.filter(tag => tag.ShotRelTag.inVideo);
        return res;
    });
};

const _updateShot = async (id, data, transaction = null) => {
    const shot = await Shot.findByPk(id, { transaction });
    if (!shot) throw ErrorResult.notFound("Shot not found");
    
    shot.set(data);
    await shot.save({ transaction });
    emitter.emit('updateShot', shot.toJSON());
    return shot;
};

const updateShotEqualizingResult = async (id, data) => {
    const { equalizingId, status } = data;
    const newStatus = Shot.equalizedStatus[status];
    await _updateShot(id, { lastEqualizeLogId: equalizingId, status: newStatus });
};

const updateShotStatus = async (id, status) => {
    return _updateShot(id, { status });
};

const updateShotDetails = async (id, userId, data) => {
    const { logMode, userStartTimeActivity, userEndTimeActivity, ...shotData } = data;
    const shot = await _updateShot(id, shotData);
    await _updateShotRelations(shot, data);

    if (logMode && logMode !== 'create') {
        emitter.emit("createShotLog", {
            shotId: id,
            userId,
            body: { startTime: userStartTimeActivity, endTime: userEndTimeActivity, mode: logMode }
        });
    }

    return getShotDetails(shot.id);
};

const deleteShotById = async (id) => {
    const shot = await Shot.findByPk(id);
    if (shot) {
        await shot.destroy();
        emitter.emit("deleteShot", shot.toJSON());
    }
    return;
};

const deleteShotsByProjectId = async (projectId) => {
    await Shot.destroy({ where: { projectId } });
    emitter.emit("updateShotCountOfProject", projectId);
    return;
};

const deleteShotsByVideoFileId = async (videoFileId) => {
    await Shot.destroy({ where: { videoFileId } });
    emitter.emit("deleteShotsVideoFile", videoFileId);
    return;
};

const countUniqueVideoFilesByProjectId = async ({ projectId }) => {
    return Shot.count({
        where: { projectId },
        distinct: true,
        col: 'videoFileId'
    });
};

const createShotForVideoFile = async (videoFileId, userId, data) => {
    const videoFile = await VideoFileService.getById(videoFileId);
    if (!videoFile) throw ErrorResult.notFound("VideoFile not found");

    const { userStartTimeActivity, userEndTimeActivity, ...shotData } = data;

    const newShot = await Shot.create({
        ...shotData,
        videoFileId,
        projectId: videoFile.projectId,
        userId,
    });

    emitter.emit("createShotLog", { shotId: newShot.id, userId, body: { startTime: userStartTimeActivity, endTime: userEndTimeActivity, mode: 'create' } });
    emitter.emit('shotCreate', newShot.toJSON());

    try {
        return await updateShotDetails(newShot.id, userId, { ...data, logMode: 'create' });
    } catch (err) {
        throw ErrorResult.internal(err, "Shot was created, but updating relations failed.");
    }
};

const importShot = async (data) => {
    let shot = await Shot.findOne({ where: { UUID: data.UUID } });
    if (!shot) {
        shot = await Shot.create({
            videoFileId: data.videoFileId,
            projectId: data.projectId,
            title: data.title,
            UUID: data.UUID
        });
    }

    // Update shot with new data
    Object.keys(data).forEach(key => shot[key] = data[key]);
    shot.ownerId = null;
    shot.gallery = JSON.stringify((data.gallery || []).map(item => { delete item.url; return item; }));

    // Categories
    const categories = await CategoryService.findOrCreateCategory(data.category);
    await _updateShotCategories(shot.id, { categoriesId: categories.map(item => item.id) });

    // Tags and Inputs
    if (data.tags && data.tags.length > 0) {
        const inputsText = [...new Set(data.tags.map(item => item.input))];
        const tagNames = data.tags.map(item => item.tag);
        
        const [tags, inputs] = await Promise.all([
            TagService.findOrCreate(tagNames),
            ShotInputService.findOrCreate(inputsText.map(title => ({ title, type: "multiSelect", valuesFrom: "tag" })))
        ]);

        const tagsToInsert = inputs.map(input => {
            const tagIds = data.tags
                .filter(t => t.input === input.title)
                .map(t => (tags.find(tagEntity => tagEntity.tag === t.tag) || {}).id)
                .filter(id => id);
            return { inputId: input.id, tagIds };
        });
        await _updateShotTags(shot.id, { tagInput: tagsToInsert });
    }

    // Default Values
    const createOrSetDefaultValue = async (key, returnKey) => {
        if (data?.[key]) {
            const result = await ShotDefaultValueService.checkAndCreateDefaultValue({
                section: data[key].section,
                key: data[key].key,
                value: data[key].value,
            });
            shot[key] = result[0][returnKey];
        }
    };
    await Promise.all([
        createOrSetDefaultValue("soundQuality", "value"),
        createOrSetDefaultValue("color", "value"),
        createOrSetDefaultValue("pictureEnvironment", "value"),
        createOrSetDefaultValue("dayNight", "value"),
        createOrSetDefaultValue("pictureModeId", "id"),
        createOrSetDefaultValue("pictureViewId", "id"),
        createOrSetDefaultValue("pictureTypeId", "id"),
        createOrSetDefaultValue("ageRangeDefaultValueId", "id")
    ]);
    
    // Languages
    shot.hasMainLang = data.mainLanguages && data.mainLanguages.length > 0;
    shot.hasDubbed = data.dubbedLanguages && data.dubbedLanguages.length > 0;
    shot.hasSubtitle = data.subtitleLanguages && data.subtitleLanguages.length > 0;
    shot.hasNarration = data.narrationLanguages && data.narrationLanguages.length > 0;
    
    const allLanguageNames = [...new Set([
        ...(data.mainLanguages || []),
        ...(data.dubbedLanguages || []),
        ...(data.subtitleLanguages || []),
        ...(data.narrationLanguages || []),
    ])];
    
    if (allLanguageNames.length > 0) {
        const languages = await LanguageService.findOrCreateLanguage(allLanguageNames);
        const langNameToId = languages.reduce((acc, lang) => ({ ...acc, [lang.name]: lang.id }), {});
        
        await _updateShotLanguages(shot, {
            mainLanguage: (data.mainLanguages || []).map(name => langNameToId[name]),
            dubbed: (data.dubbedLanguages || []).map(name => langNameToId[name]),
            subtitle: (data.subtitleLanguages || []).map(name => langNameToId[name]),
            narration: (data.narrationLanguages || []).map(name => langNameToId[name]),
        });
    }

    await shot.save();
    return shot;
};

module.exports = {
    getShotFormBasicInfo,
    getShotsExportInfo,
    listShots,
    getShotStatusesByVideoFile,
    getShotsByIds,
    listSpecialShots,
    checkUserAccessToShot,
    getShotDetails,
    getShotsDetails,
    listShotsByVideoFile,
    updateShotEqualizingResult,
    updateShotStatus,
    updateShotDetails,
    deleteShotById,
    deleteShotsByProjectId,
    deleteShotsByVideoFileId,
    countUniqueVideoFilesByProjectId,
    createShotForVideoFile,
    importShot
};
