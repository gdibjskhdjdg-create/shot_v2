const path = require('path');
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const Service = require("../../_default/service");
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

const LanguageService = require("../../services/language/Language.service");
const CategoryService = require("../../services/category/Category.service");
const ShotDefaultValueService = require('./ShotDefaultValue.service');

const { createPaginationQuery } = require("../../../helper/SqlHelper.tool");
const OwnerService = require('../owner/Owner.service');
const ShotInputService = require('./ShotInput.service');
const KeywordService = require('../keyword/Keyword.service');
const ErrorResult = require('../../../helper/error.tool');
const emitter = require('../../_default/eventEmitter');
const { takeScreenShot } = require('../../services/FFmpeg/FFmpeg.service');
const GalleryParser = require('../../../helper/galleryParser.tool');
const TableCountService = require('../tableCount/TableCount.service');


class ShotService extends Service {
    constructor(videoFileService = () => { }) {
        super(Shot);

        this.videoFileService = videoFileService;
        this.pathToRoot = path.join(__dirname, '..', '..', '..');

        this.shotList = this.shotList.bind(this);
        this.updateMainShotInfo = this.updateMainShotInfo.bind(this);
    }

    async getBasicInfoForShot() {
        const languages = await LanguageService.get();
        const owners = await OwnerService.get();
        const categories = await CategoryService.get();
        const defaultValue = await ShotDefaultValueService.getDefault();
        const inputs = await ShotInputService.get();

        return {
            languages,
            categories,
            owners,
            inputs: inputs.filter(item => item.valuesFrom === "tag"),
            defaultValue
        }
    }

    async getExportInfoShots({ shots: shotsId, isExcludeMode, filters = {} }) {

        let shots;
        if (isExcludeMode) {
            shots = (await this.specialShotList({ ...filters, excludesId: shotsId, page: 1, take: null })).shots
        } else {
            shots = await Shot.findAll({
                where: { id: shotsId }, include: [{
                    model: VideoFile,
                    attributes: ['id', 'size', 'duration'],
                    as: 'videoFile'
                }]
            })
        }


        let result = {
            shotDuration: 0,
            videoSize: 0,
            videoDuration: 0,
        }

        let tempVideosId = []

        for (const shot of shots) {
            const { endTime, startTime } = shot
            const { videoFile } = shot.toJSON()

            result.shotDuration += (+endTime - +startTime)

            if (videoFile && !tempVideosId.includes(videoFile.id)) {
                result.videoSize += (videoFile ? +videoFile.size : 0)
                result.videoDuration += (videoFile ? +videoFile.duration : 0)

                tempVideosId.push(videoFile.id)
            }

        }


        return result

    }

    async shotList(filters = {}) {
        const {
            id = null,
            page = null,
            take = null,
            search = "",
            userId = null,
            status = null,
            projectId = null,
            videoFileId = null,
            withCheckStudio = true
        } = filters;

        let sqlQuery = { where: {} };

        if (id) {
            sqlQuery.where.id = id;
        }
        if (status) {
            sqlQuery.where.status = status;
        }
        if (TypeTool.boolean(search)) {
            sqlQuery.where.title = { [Op.like]: `%${TypeTool.string(search).trim()}%` }
        }
        if (TypeTool.boolean(userId)) {
            sqlQuery.where.userId = userId;
        }
        if (TypeTool.boolean(videoFileId)) {
            sqlQuery.where.videoFileId = videoFileId;
        }
        if (TypeTool.boolean(projectId)) {
            sqlQuery.where.projectId = projectId;
        }

        sqlQuery = createPaginationQuery(sqlQuery, page, take);

        sqlQuery.include = [
            {
                model: ShotRelTag,
                attributes: ['inVideo'],
                as: 'tagIds',
            },
            {
                model: VideoFile,
                attributes: ['id', 'originalName', 'originalPath'],
                as: 'videoFile'
            },
            {
                model: User,
                attributes: ['id', 'fullName'],
                as: 'user'
            },
            {
                model: Project,
                attributes: ['id', 'title'],
                as: 'project'
            }
        ];

        if (withCheckStudio) {
            sqlQuery.include.push({
                model: ExportVideoDetail,
                attributes: ["exportId"],
                as: 'export',
                include: [{
                    model: ExportVideoFile,
                    attributes: ["productId"],
                    as: "export"
                }]
            })
        }

        sqlQuery.order = [['updatedAt', 'DESC'], ['id', 'DESC']];

        const shots = await Shot.findAll({
            distinct: true,
            ...sqlQuery
        });

        let count = await TableCountService.getTableCountFromRedis(Shot, sqlQuery);
        if(count === null){
            count =  await Shot.count({ distinct: true, ...sqlQuery });
            await TableCountService.storeTableCountInRedis(Shot, sqlQuery, count);
        }

        return { shots, count };
    }

    async getShotVideoFileStatus(videoFileId) {
        const shots = await Shot.findAll({
            where: { videoFileId },
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('status')), 'status']]
        })

        return shots.map(x => x.status);
    }

    async getByIds(id = []) {
        return Shot.findAll({ where: { id } })
    }

    async specialShotList(filters = {}) {
        const {
            id = null,
            excludesId = null,
            page = null,
            take = null,
            tagId = null,
            categoryId = null,
            ownerId = null,
            hasLastEqualizeLogId = null,
            inputIds = [],
            tagInVideo = false,
            search = "",
            pictureDescription = "",
            withCheckStudio = true,
            ...otherFilters
        } = filters;

        const currentSearch = [
            "userId", "videoFileId", "startDate", "hasCameraShake", "hasLogo", "hasMusic", "isArchive",
            "projectId", "soundQuality", "color", "pictureEnvironment", "soundQuality", "ageRangeDefaultValueId",
            "dayNight", "qualityGrade", "pictureViewId", "pictureModeId", "pictureTypeId",
            "gender"
        ]

        const languageSearchKey = ["mainLanguage", "dubbed", "subtitle", "narration"];

        let sqlQuery = {
            where: {},
            order: [['updatedAt', 'DESC']],
            include: [
                {
                    model: ShotRelTag,
                    attributes: ['inVideo'],
                    as: 'tagIds',
                },
                // {
                //     model: Category,
                //     attributes: ['id', 'name'],
                //     as: 'category',
                // },
                {
                    model: VideoFile,
                    attributes: ['id', 'size', 'duration', 'originalName', 'originalPath'],
                    as: 'videoFile'
                },
                {
                    model: User,
                    attributes: ['id', 'fullName'],
                    as: 'user'
                },
                {
                    model: Project,
                    attributes: ['id', 'title'],
                    as: 'project'
                }
            ]
        };

        if (id) sqlQuery.where.id = id;
        if (ownerId) sqlQuery.where.ownerId = ownerId;
        if (excludesId) sqlQuery.where.id = { [Op.notIn]: excludesId };
        if (TypeTool.boolean(pictureDescription)) {
            sqlQuery.where.pictureDescription = { [Op.like]: `%${TypeTool.string(pictureDescription).trim()}%` };
        }
        if (TypeTool.boolean(search)) {
            sqlQuery.where.title = { [Op.like]: `%${TypeTool.string(search).trim()}%` };
        }

        if (!TypeTool.isNullUndefined(hasLastEqualizeLogId)) {
            sqlQuery.where.lastEqualizeLogId = hasLastEqualizeLogId == 1 ? { [Op.not]: null } : null
        }

        currentSearch.forEach(key => {
            if (!TypeTool.isNullUndefined(otherFilters[key]) && TypeTool.isNotEmptyString(otherFilters[key])) {
                sqlQuery.where[key] = otherFilters[key];
            }
        })

        if (languageSearchKey.find(key => !TypeTool.isNullUndefined(otherFilters[key]))) {
            let validLanguage = [];
            languageSearchKey.filter(key => !TypeTool.isNullUndefined(otherFilters[key])).forEach(key => {
                validLanguage.push({
                    type: key,
                    languageId: otherFilters[key]
                })
            });

            validLanguage.forEach((lang, index) => {
                sqlQuery.include.push({
                    model: ShotRelLanguage,
                    as: `languageIds_${index}`,
                    where: { ...lang },
                    required: true,
                })
            });
        }

        if (categoryId) {
            sqlQuery.include.push({
                model: Category,
                where: {
                    id: categoryId
                },
                as: 'category'
            })
        }

        if (tagId) {
            const whereInTag = {
                tagId,
                inVideo: TypeTool.boolean2Int(tagInVideo)
            }

            if (Array.isArray(inputIds) && inputIds) {
                whereInTag.inputId = inputIds
            }

            sqlQuery.include.push({
                model: ShotRelTag,
                where: whereInTag,
                as: 'tagIds'
            })
        }

        if (withCheckStudio) {
            sqlQuery.include.push({
                model: ExportVideoDetail,
                attributes: ["exportId"],
                as: 'export',
                include: [{
                    model: ExportVideoFile,
                    attributes: ["productId"],
                    as: "export"
                }]
            })
        }

        sqlQuery = createPaginationQuery(sqlQuery, page, take);

        const shots = await Shot.findAll({
            distinct: true,
            ...sqlQuery
        });

        let count = await TableCountService.getTableCountFromRedis(Shot, sqlQuery);
        if(count === null){
            count =  await Shot.count({ distinct: true, ...sqlQuery });
            await TableCountService.storeTableCountInRedis(Shot, sqlQuery, count);
        }

        return { shots, count };
    }

    async checkAccessToShot(id, userId) {
        return await Shot.findOne({ where: { id, userId } })
    }

    async findExcludeIds(id = []) {
        return Shot.findAll({
            where: {
                id: {
                    [Op.notIn]: id
                }
            }
        })
    }

    async shotsDetail(id = []) {
        let items = await Shot.findAll({
            where: { id },
            include: [
                { model: Category, attributes: ['id', 'name'], as: 'category' },
                { model: ShotRelTag, as: 'tagIds' },
                { model: Project, as: "project", attributes: ['id', 'title'] },
                {
                    model: VideoFile,
                    attributes: ['id', 'projectId', 'format', 'duration', 'originalName', 'originalPath', 'width', 'height', 'frameRate', 'aspectRatio'],
                    as: 'videoFile',
                },
            ],
        });

        if (!items?.length) {
            throw ErrorResult.notFound()
        }

        items = items.map(x => x.toJSON());

        const relLanguage = await ShotRelLanguage.findAll({ where: { shotId: id } });
        for (let response of items) {
            if (response.videoFileId) {
                response.videoFileUrl = this.videoFileService.getVideoFileURL(response.videoFileId);
            }
            else {
                response.videoFileUrl = null;
            }

            let startDate = response.startDate ? TypeTool.timestampToJalaliDate(+response.startDate) : null
            if (TypeTool.isValidJalaliDate(startDate)) {
                response.startDate = startDate
            }

            let endDate = response.endDate ? TypeTool.timestampToJalaliDate(+response.endDate) : null
            if (TypeTool.isValidJalaliDate(endDate)) {
                response.endDate = endDate
            }

            response.languageIds = relLanguage.filter(item => item.shotId === response.id).map(item => item.toJSON());

            const tagIds = [...(new Set(response.tagIds.map(item => item.tagId)))];

            let tags = await KeywordService.getByAttribute('id', tagIds);

            tags = tags.map(item => item.toJSON());

            const newTags = response.tagIds.map(rel => {
                const tag = tags.find(item => item.id === rel.tagId);
                if (!tag) return { notFound: true };

                return { ...tag, ShotRelTag: rel };
            }).filter(item => !item.notFound);

            response.allTags = newTags;
            delete response.tagIds;

            response.gallery = GalleryParser(response.gallery);
        }

        return items;
    }


    async detail(id) {
        let response = await Shot.findOne({
            where: { id },
            include: [
                { model: Category, attributes: ['id', 'name'], as: 'category' },
                { model: ShotRelTag, as: 'tagIds' },
                { model: Project, as: "project", attributes: ['id', 'title'] },
                {
                    model: VideoFile,
                    attributes: ['id', 'projectId', 'format', 'originalName', 'originalPath', 'width', 'height', 'frameRate', 'aspectRatio'],
                    as: 'videoFile',
                },
            ],
        });

        if (!response) {
            throw ErrorResult.notFound()
        }

        response = response.toJSON();

        let startDate = response.startDate ? TypeTool.timestampToJalaliDate(+response.startDate) : null
        if (TypeTool.isValidJalaliDate(startDate)) {
            response.startDate = startDate
        }

        let endDate = response.endDate ? TypeTool.timestampToJalaliDate(+response.endDate) : null
        if (TypeTool.isValidJalaliDate(endDate)) {
            response.endDate = endDate
        }

        if (response.videoFileId) {
            response.videoFileUrl = this.videoFileService.getVideoFileURL(response.videoFileId);
        }
        else {
            response.videoFileUrl = null;
        }

        const relLanguage = await ShotRelLanguage.findAll({ where: { shotId: id } });
        response.languageIds = relLanguage.map(item => item.toJSON());

        const tagIds = [...(new Set(response.tagIds.map(item => item.tagId)))];

        let tags = await KeywordService.getByAttribute('id', tagIds);

        tags = tags.map(item => item.toJSON());

        const newTags = response.tagIds.map(rel => {
            const tag = tags.find(item => item.id === rel.tagId);
            if (!tag) return { notFound: true };

            return { ...tag, ShotRelTag: rel };
        }).filter(item => !item.notFound);

        response.allTags = newTags;
        delete response.tagIds;

        response.gallery = GalleryParser(response.gallery);

        return response;
    }

    async getSections_Service(videoFileId, query = {}) {
        let response = await Shot.findAll({
            where: {
                videoFileId,
                ...(query.shotStatus ? { status: query.shotStatus } : {})
            },
            include: [{ model: ShotRelTag, as: 'tagIds' }],
            attributes: ['id', 'status', 'title', 'startTime', 'endTime', 'lastEqualizeLogId'],
        });

        let tagIds = [];
        response = response.map(shot => {
            shot.tagIds.forEach(tag => tagIds.push(tag.tagId));
            return shot.toJSON();
        });
        tagIds = [...(new Set(tagIds))]

        let tags = await KeywordService.getByAttribute('id', tagIds);

        tags = tags.map(item => item.toJSON());

        response = response.map(res => {
            const newTags = res.tagIds.map(rel => {
                const tag = tags.find(item => item.id === rel.tagId);
                if (!tag) return { notFound: true };

                return { ...tag, ShotRelTag: rel };
            }).filter(item => !item.notFound);

            res.allTags = newTags.filter(tag => !tag.ShotRelTag.inVideo);
            res.inVideoTags = newTags.filter(tag => tag.ShotRelTag.inVideo);
            delete res.tagIds;

            return { ...res };
        })

        return response;
    }

    async updateMainShotInfo(id, data, otherInfo = {}) {

        const { transaction = null } = otherInfo;

        const shot = await this.getById(id, { transaction });

        const updateInfo = {}
        Object.keys(data).forEach(key => {
            if (Object.keys(shot.dataValues).includes(key)) {
                updateInfo[key] = data[key]
            }
        });

        shot.set(updateInfo);
        await shot.save();

        emitter.emit('updateShot', shot.toJSON())

        return shot;
    }

    async setEqualizingResultInShot(id, data) {
        const {
            equalizingId,
            status,
        } = data;

        const newStatus = Shot.equalizedStatus[status]

        await this.updateMainShotInfo(id, {
            lastEqualizeLogId: equalizingId,
            status: newStatus
        })
    }

    async updateStatus(id, status) {
        const shot = await this.getById(id)
        shot.status = status
        await shot.save()
    }

    async updateInitShot(id, userId, data) {
        return await this.updateShot(id, userId, {
            ...data,
            status: 'editor',
            logMode: "init-check"
        });
    }

    async updateEditorShot(id, userId, data) {
        return await this.updateShot(id, userId, {
            ...data,
            status: 'equalizing',
            logMode: "editor"
        });
    }

    async updateEqualizingShot(id, userId, data) {
        return await this.updateShot(id, userId, {
            ...data,
            status: 'equalized',
            logMode: "equalizing"
        });
    }

    async updateShot(id, userId, data) {
        const logMode = data.logMode
        const shot = await this.updateMainShotInfo(id, data);
        await this.updateRelTables(shot, data);

        if (!['create'].includes(logMode)) {
            emitter.emit("createShotLog", {
                shotId: id,
                userId,
                body: {
                    startTime: data.userStartTimeActivity,
                    endTime: data.userEndTimeActivity,
                    mode: logMode ?? "update"
                }
            });
        }

        return await this.detail(shot.id);
    }

    async deleteShot(id) {
        const shot = await this.getById(id);
        // const videoFileId = shot.videoFileId;

        await shot.destroy();

        // emitter.emit("updateShotCount", videoFileId)
        emitter.emit("deleteShot", shot)

        return;
    }

    async deleteShotsOfProject(projectId) {
        await Shot.destroy({ where: { projectId } });
        emitter.emit("updateShotCountOfProject", projectId);
        return;
    }

    async deleteShotsOfVideoFile(videoFileId) {
        await Shot.destroy({ where: { videoFileId } });
        // emitter.emit("updateShotCount", videoFileId)
        emitter.emit("deleteShotsVideoFile", videoFileId)

        return;
    }

    async countOfUniqueVideoFile({ projectId }) {
        // return await Shot.count({
        //     where: { projectId },
        //     attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('videoFileId')), 'videoFileId']]
        // })

        // const result = await Shot.findOne({
        //     where: { projectId },
        //     attributes: [
        //       [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalShots'],
        //       [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('videoFileId'))), 'distinctVideoFiles']
        //     ],
        //     raw: true
        //   });

        //   result.distinctVideoFiles

        const videoFiles = await Shot.findAll({
            where: { projectId },
            attributes: [
                'videoFileId',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'shotCount']
            ],
            group: 'videoFileId',
            raw: true
        });

        // result:
        // [
        //   { videoFileId: 1, shotCount: 5 },
        //   { videoFileId: 2, shotCount: 3 },
        //   ...
        // ]

        return videoFiles.length;
    }

    async createInitShotForVideoFile(videoFileId, userId, data) {
        return await this.createShotForVideoFile(videoFileId, userId, {
            ...data,
            status: "editor"
        });
    }

    async createEditorShotForVideoFile(videoFileId, userId, data) {
        return await this.createShotForVideoFile(videoFileId, userId, {
            ...data,
            status: "equalizing"
        });
    }

    async createShotForVideoFile(videoFileId, userId, data) {
        const videoFile = await this.videoFileService.getById(videoFileId);
        if (!videoFile) {
            throw ErrorResult.notFound();
        }

        let newShot = await Shot.create({
            ...data,
            videoFileId,
            projectId: videoFile.projectId,
            userId,
        });

        emitter.emit("createShotLog", { shotId: newShot.id, userId, body: { startTime: data.userStartTimeActivity, endTime: data.userEndTimeActivity, mode: 'create' } });
        emitter.emit('shotCreate', newShot.toJSON())

        try {
            await this.updateShot(newShot.id, userId, data);
            return newShot;
        }
        catch (err) {
            throw ErrorResult.internal(err, "shot is Created But Error In Update");
        }
    }

    async updateRelTables(shot, params) {
        const data = { ...params }

        await this.createDefaultValue(data);
        await this.updateShotCategories(shot.id, data);
        await this.updateShotTagInVideo(shot.id, data);
        await this.updateShotTag(shot.id, data);
        shot = await this.updateShotLanguage(shot, data);
        shot = await this.updateShotGallery(shot, data);
    }

    async updateShotGallery(shot, data) {
        const { imgGallery } = data;

        const timeOfImg = imgGallery ? imgGallery.map(item => item.time) : [];

        let oldGallery = [];
        if (shot.gallery) {
            oldGallery = JSON.parse(shot.gallery);
        }

        const existTime = oldGallery.map(item => item.time);

        const newTimes = timeOfImg.filter(item => !existTime.includes(item));

        const notChangeImgs = oldGallery.filter(item => timeOfImg.includes(item.time));
        const mustRemoveImgs = oldGallery.filter(item => !timeOfImg.includes(item.time));

        const video = await this.videoFileService.getById(shot.videoFileId);

        const galleryPath = path.join("gallery", shot.id.toString());
        const pathToStoreImg = path.join(this.pathToRoot, appConfigs.STORE_FOLDER_FROM_APP_ROOT, galleryPath);

        if (!fs.existsSync(pathToStoreImg)) {
            fs.mkdirSync(pathToStoreImg, { recursive: true });
        }

        let newFiles = [];
        if (newTimes.length > 0) {
            newFiles = await takeScreenShot(`${video.path}/${video.name}`, `${pathToStoreImg}`, newTimes);
            newFiles = newFiles.map(item => ({
                ...item,
                path: galleryPath
            }));
        }

        for (let i = 0; i < mustRemoveImgs.length; i++) {
            try {
                fs.unlinkSync(path.join(this.pathToRoot, mustRemoveImgs[i].path, mustRemoveImgs[i].fileName));
            }
            catch (err) { }
        }

        let newGalleryArr = [...newFiles, ...notChangeImgs];
        let timeOfMainImg = imgGallery.findIndex(item => item.mainImg);
        if (timeOfMainImg === -1) {
            timeOfMainImg = 0;
        }

        newGalleryArr = newGalleryArr.map((item, index) => ({
            ...item,
            mainImg: timeOfMainImg === index
        }))

        shot.gallery = JSON.stringify(newGalleryArr);
        await shot.save();

        return shot;
    }

    async updateShotLanguage(shot, data, otherInfo = {}) {
        const { transaction = null } = otherInfo;

        const languageTypes = [
            { key: "mainLanguage", inShot: "hasMainLang" },
            { key: "dubbed", inShot: "hasDubbed" },
            { key: "subtitle", inShot: "hasSubtitle" },
            { key: "narration", inShot: "hasNarration" },
        ];

        for (let i = 0; i < languageTypes.length; i++) {
            const languageIds = data[languageTypes[i].key];
            if (!TypeTool.isNullUndefined(languageIds) && Array.isArray(languageIds)) {
                if (languageIds.includes(0) || languageIds.includes('0')) {
                    shot[languageTypes[i].inShot] = null;
                }
                else {
                    shot[languageTypes[i].inShot] = languageIds.length === 0 ? 0 : 1;

                    const dataToInsert = languageIds.map(item => ({
                        shotId: shot.id,
                        languageId: item,
                        type: languageTypes[i].key
                    }))

                    await ShotRelLanguage.destroy({ where: { shotId: shot.id, type: languageTypes[i].key } });
                    await ShotRelLanguage.bulkCreate(dataToInsert);
                }
            }
        }

        await shot.save({ transaction });

        return shot;
    }

    async updateShotCategories(shotId, data = {}, more = {}) {
        const { categoriesId } = data;

        if (TypeTool.isNullUndefined(categoriesId)) {
            return;
        }

        const { transaction = null } = more;
        if (Array.isArray(categoriesId)) {
            await ShotRelCategory.destroy({ where: { shotId } }, { transaction });
            await ShotRelCategory.bulkCreate(categoriesId.map(item => ({ shotId, categoryId: item })), { transaction });
        }
    }

    async updateShotTag(shotId, data = {}, more = {}) {
        /* tagInput [{inputId: 1, tagIds: []}] */
        const { tagInput } = data;
        if (TypeTool.isNullUndefined(tagInput)) {
            return;
        }
        const { transaction = null } = more;

        let changedTags = []

        const inputIds = tagInput.map(item => item.inputId);
        const tagsRemoved = await ShotRelTag.findAll({ where: { shotId, inputId: inputIds, inVideo: 0 } }, { transaction })
        await ShotRelTag.destroy({ where: { shotId, inputId: inputIds, inVideo: 0 } }, { transaction });
        
        changedTags = tagsRemoved.map(item => item.tagId)

        let bulkData = [];
        let newTags = [];

        tagInput.forEach(item => {
            item.tagIds.forEach(tag => {
                let isNew = false;
                if (!parseInt(tag)) {
                    newTags.push(tag);
                    isNew = true;
                }
                bulkData.push({
                    isNew,
                    shotId,
                    tagId: tag,
                    inVideo: 0,
                    inputId: item.inputId,
                })
            })
        })

        const newTagsEntity = await KeywordService.findOrCreateKeywordArray(newTags);
        bulkData = bulkData.map(item => {
            if (item.isNew) {
                let findTag = newTagsEntity.find(tag => tag.tag === item.tagId);
                if (findTag) {
                    item.tagId = findTag.id;
                }
            }
            return item;
        })

        changedTags = [...changedTags, ...bulkData.map(item => item.tagId)]
        await ShotRelTag.bulkCreate(bulkData, { transaction });

        changedTags = [...new Set([...changedTags])]
        await KeywordService.updateKeywordCount(changedTags)

        return;
    }

    async updateShotTagInVideo(shotId, data, more = {}) {
        /* tagInVideo [{tagId: 1, times: TagInVideoDetail_VO}] */
        const { tagInVideo } = data;
        if (TypeTool.isNullUndefined(tagInVideo)) {
            return;
        }

        const { transaction = null } = more;
        await ShotRelTag.destroy({ where: { shotId, inputId: null, inVideo: 1 } }, { transaction });

        let bulkData = [];
        let newTags = [];

        tagInVideo.forEach(item => {
            let isNew = false;
            if (!parseInt(item.tagId)) {
                newTags.push(item.tagId);
                isNew = true;
            }

            bulkData.push({
                isNew,
                shotId,
                tagId: item.tagId,
                inVideo: 1,
                otherInfo: JSON.stringify({ times: item.times })
            })
        })

        const newTagsEntity = await KeywordService.findOrCreateKeywordArray(newTags);

        bulkData = bulkData.map(item => {
            if (item.isNew) {
                let findTag = newTagsEntity.find(tag => tag.tag === item.tagId);
                if (findTag) {
                    item.tagId = findTag.id;
                }
            }
            return item;
        })

        await ShotRelTag.bulkCreate(bulkData, { transaction });

        return;
    }

    async createDefaultValue(data) {
        const keyToCreateDefaultValue = ["frameRate", "frameWidth", "frameHeight", "aspectRatio", "format"];
        for (let i = 0; i < keyToCreateDefaultValue.length; i++) {
            const section = keyToCreateDefaultValue[i];
            if (TypeTool.boolean(data[section])) {
                await ShotDefaultValueService.checkAndCreateDefaultValue({
                    section,
                    key: data[section],
                    value: data[section]
                })
            }
        }
    }

    async deleteByProjectId(projectId) {
        await Shot.destroy({ where: { projectId } })
    }

    async findOrCreateShotFromImportData(data) {
        // @TODO: detect change and get confirm from admin; 

        let shot = await Shot.findOne({ where: { UUID: data.UUID } });
        if (!shot) {
            shot = await Shot.create({
                videoFileId: data.videoFileId,
                projectId: data.projectId,
                title: data.title,
            });
        }

        Object.keys(data).forEach(key => shot[key] = data[key])

        shot.ownerId = null;
        shot.gallery = JSON.stringify(data.gallery.map(item => { delete item.url; return item; }));

        const categories = await CategoryService.findOrCreateCategory(data.category);
        await this.updateShotCategories(shot.id, { categoriesId: categories.map(item => item.id) });

        const inputsText = [...new Set(data.tags.map(item => item.input))];
        const tags = await KeywordService.findOrCreateKeywordArray(data.tags.map(item => item.tag));
        const inputs = await ShotInputService.findOrCreate(inputsText.map(item => ({ title: item, type: "multiSelect", valuesFrom: "tag" })))
        const tagsToInsert = inputs.map(item => {
            let tagIds = data.tags.filter(it => item.title === it.input).map(item => tags.find(it => it.tag === item.tag).id)
            return { inputId: item.id, tagIds };
        })
        await this.updateShotTag(shot.id, { tagInput: tagsToInsert });

        const createOrSetDefaultValue = async (key, returnKey) => {
            if (data?.[key]) {
                shot[key] = (await ShotDefaultValueService.checkAndCreateDefaultValue({
                    section: data?.[key].section,
                    key: data?.[key].key,
                    value: data?.[key].value,
                }))[0][returnKey];
            }
        }

        await createOrSetDefaultValue("soundQuality", "value");
        await createOrSetDefaultValue("color", "value");
        await createOrSetDefaultValue("pictureEnvironment", "value");
        await createOrSetDefaultValue("dayNight", "value");
        await createOrSetDefaultValue("pictureModeId", "id");
        await createOrSetDefaultValue("pictureViewId", "id");
        await createOrSetDefaultValue("pictureTypeId", "id");
        await createOrSetDefaultValue("ageRangeDefaultValueId", "id");

        await shot.save();

        shot.hasMainLang = data.mainLanguages === null ? null : (data.mainLanguages.length > 0);
        shot.hasDubbed = data.dubbedLanguages === null ? null : (data.dubbedLanguages.length > 0);
        shot.hasSubtitle = data.subtitleLanguages === null ? null : (data.subtitleLanguages.length > 0);
        shot.hasNarration = data.narrationLanguages === null ? null : (data.narrationLanguages.length > 0);

        const allLanguages = [...new Set([
            ...(shot.hasMainLang ? data.mainLanguages : []),
            ...(shot.hasDubbed ? data.dubbedLanguages : []),
            ...(shot.hasSubtitle ? data.subtitleLanguages : []),
            ...(shot.hasNarration ? data.narrationLanguages : []),
        ])];

        const languages = await LanguageService.findOrCreateLanguage(allLanguages);
        let dataLanguage = {
            mainLanguage: data.mainLanguages === null ? [0] : (data.mainLanguages.map(item => languages.find(it => it.name === item).id)),
            dubbed: data.dubbedLanguages === null ? [0] : (data.dubbedLanguages.map(item => languages.find(it => it.name === item).id)),
            subtitle: data.subtitleLanguages === null ? [0] : (data.subtitleLanguages.map(item => languages.find(it => it.name === item).id)),
            narration: data.narrationLanguages === null ? [0] : (data.narrationLanguages.map(item => languages.find(it => it.name === item).id)),
        }
        await this.updateShotLanguage(shot, dataLanguage);
    }
}

module.exports = ShotService;
