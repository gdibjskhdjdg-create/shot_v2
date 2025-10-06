const path = require('path');
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const redis = require('../../../db/redis');
const { v4: uuidv4 } = require('uuid');

const Service = require("../../_default/service");
const {
    VideoDetail,
    VideoDetailScore,
    User,
    VideoDetailRelCategory,
    Category,
    VideoDetailRelTag,
    VideoFile,
    Project,
    VideoDetailRelLanguage,
} = require("../../_default/model");

const TypeTool = require("../../../helper/type.tool");

const LanguageService = require("../../services/language/Language.service");
const CategoryService = require('../../services/category/Category.service');
const ShotDefaultValueService = require('../shotList/ShotDefaultValue.service');
const ShotInputService = require('../shotList/ShotInput.service');

const { createPaginationQuery } = require("../../../helper/SqlHelper.tool");
const OwnerService = require('../owner/Owner.service');
const KeywordService = require('../keyword/Keyword.service');
const ErrorResult = require('../../../helper/error.tool');
const { takeScreenShot } = require('../../services/FFmpeg/FFmpeg.service');
const GalleryParser = require('../../../helper/galleryParser.tool');
const emitter = require('../../_default/eventEmitter');
const { VideoDetailStatus_Enum, VideoDetailShotStatus_Enum } = require('../../models/videoDetail/enum/VideoDetail.enum');
const TableCountService = require('../tableCount/TableCount.service');

class VideoDetailService extends Service {
    constructor(videoFileService = () => { }, shotService = () => { }, videoDetailScoreService = () => { }) {
        super(VideoDetail);

        this.videoDetailScoreService = videoDetailScoreService;
        this.videoFileService = videoFileService;
        this.shotService = shotService
        this.pathToRoot = path.join(__dirname, '..', '..', '..');

        this.videoDetailList = this.videoDetailList.bind(this);
        this.updateMainVideoDetailInfo = this.updateMainVideoDetailInfo.bind(this);
    }

    async findOrCreateVideoDetail(videoFile) {
        let detail = await VideoDetail.findOne({ where: { videoFileId: videoFile.id } });
        if (!detail) {
            let aiTagStatus = videoFile.isAI ? 'queue' : null
            detail = await VideoDetail.create({
                title: videoFile.originalName,
                userId: videoFile.userId,
                projectId: videoFile.projectId,
                videoFileId: videoFile.id,
                status: VideoDetailStatus_Enum.init.value,
                aiTagStatus,
                shotStatus: VideoDetailShotStatus_Enum.initCheck.value
            })
        }

        return detail
    }

    async checkAccessToVideo(videoFileId, userId) {
        const response = await VideoDetail.findOne({ where: { videoFileId, userId } });
        return !!response;
    }

    async checkCanUpdateInitVideoDetail(videoFileId) {
        const response = await VideoDetail.findOne({ where: { videoFileId } });
        return response && [VideoDetailStatus_Enum.init.value, VideoDetailStatus_Enum.cleaning.value].includes(response.status);
    }

    async getBasicInfoForVideoDetail() {
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

    async videoDetailList(filters = {}) {
        const {
            page = null,
            take = null,
            search = "",
            status = null,
            shotStatus = null,
            userId = null,
            projectId = null,
            videoFileId = null,
        } = filters

        let sqlQuery = { where: {} };

        if (TypeTool.boolean(videoFileId)) {
            sqlQuery.where.videoFileId = videoFileId;
        }

        if (status) {
            sqlQuery.where.status = status;
        }
        if (shotStatus) {
            sqlQuery.where.shotStatus = shotStatus;
        }
        if (TypeTool.boolean(search)) {
            sqlQuery.where.title = { [Op.like]: `%${TypeTool.string(search).trim()}%` }
        }
        if (TypeTool.boolean(userId)) {
            sqlQuery.where.userId = userId;
        }

        if (TypeTool.boolean(projectId)) {
            sqlQuery.where.projectId = projectId;
        }

        sqlQuery.include = [
            {
                model: VideoDetailRelTag,
                attributes: ['inVideo'],
                as: 'tagIds',
            },
            {
                model: VideoFile,
                attributes: ['id', "name", "duration", "height", "width", "format", "status", "shotCount", 'originalName', 'originalPath'],
                as: 'videoFile',
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
        sqlQuery.order = [['updatedAt', 'DESC'], ['videoFileId', 'DESC']];
        sqlQuery = createPaginationQuery(sqlQuery, page, take);

        // const response = await VideoDetail.findAndCountAll({
        //     ...sqlQuery,
        //     distinct: true
        // });

        const videoDetails = await VideoDetail.findAll({ ...sqlQuery, distinct: true });

        let count = await TableCountService.getTableCountFromRedis(VideoDetail, sqlQuery);
        if(count === null){
            count =  await VideoDetail.count({ distinct: true, ...sqlQuery });
            await TableCountService.storeTableCountInRedis(VideoDetail, sqlQuery, count);
        }

        return { videoDetails, count };
    }

    async getByVideoIds(videoFileIds = []) {
        return VideoDetail.findAll({
            where: {
                videoFileId: videoFileIds
            }
        })
    }

    async findExcludeIds(videoFileIds = []) {
        return VideoDetail.findAll({
            where: {
                videoFileIds: {
                    [Op.notIn]: videoFileIds
                }
            }
        })
    }

    async detail(videoFileId) {
        let sqlWhere = {}
        if(videoFileId) sqlWhere.videoFileId = videoFileId;

        let items = await VideoDetail.findAll({
            where: { ...sqlWhere },
            include: [
                { model: Category, attributes: ['id', 'name'], as: 'category' },
                { model: VideoDetailRelTag, as: 'tagIds' },
                { model: Project, as: "project", attributes: ['id', 'title'] },
                {
                    model: VideoFile,
                    attributes: [
                        'id', 'projectId', 'format', 'originalName', 'duration', 'size',
                        'originalPath', 'width', 'height', 'frameRate', 'aspectRatio', "UUID"
                    ],
                    as: 'videoFile',
                },
            ],
        });
        if (!items?.length) {
            throw ErrorResult.notFound()
        }
        items = items.map(x => x.toJSON());

        const relLanguage = await VideoDetailRelLanguage.findAll({ where: { videoFileId } });
        for (let response of items) {
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

            response.languageIds = relLanguage.filter(item => item.videoFileId === response.videoFileId).map(item => item.toJSON());

            const tagIds = [...(new Set(response.tagIds.map(item => item.tagId)))];

            let tags = await KeywordService.getByAttribute('id', tagIds);

            tags = tags.map(item => item.toJSON());

            const newTags = response.tagIds.map(rel => {
                const tag = tags.find(item => item.id === rel.tagId);
                if (!tag) return { notFound: true };
                return { ...tag, VideoDetailRelTag: rel };
            }).filter(item => !item.notFound);

            response.allTags = newTags;
            delete response.tagIds;

            response.aiTagsId = response.aiTagsId ? JSON.parse(response.aiTagsId) : []
            response.gallery = GalleryParser(response.gallery);
        }
        return items;
    }

    async setOwner2VideosOfProject(projectId, ownerId) {
        await VideoDetail.update({ ownerId }, { where: { projectId } });
    }

    async getSections_Service(videoFileId) {
        let response = await VideoDetail.findAll({
            where: { videoFileId },
            include: [{ model: VideoDetailRelTag, as: 'tagIds' }],
            attributes: ['id', 'title', 'startTime', 'endTime'],
        });


        let tagIds = [];
        response = response.map(videoDetail => {
            videoDetail.tagIds.forEach(tag => tagIds.push(tag.tagId));
            return videoDetail.toJSON();
        });
        tagIds = [...(new Set(tagIds))]

        let tags = await KeywordService.getByAttribute('id', tagIds);

        tags = tags.map(item => item.toJSON());

        response = response.map(res => {
            const newTags = res.tagIds.map(rel => {
                const tag = tags.find(item => item.id === rel.tagId);
                if (!tag) return { notFound: true };

                return { ...tag, VideoDetailRelTag: rel };
            }).filter(item => !item.notFound);

            res.allTags = newTags.filter(tag => !tag.VideoDetailRelTag.inVideo);
            res.inVideoTags = newTags.filter(tag => tag.VideoDetailRelTag.inVideo);
            delete res.tagIds;

            return { ...res };
        })

        return response;
    }

    async updateMainVideoDetailInfo(videoFileId, data, otherInfo = {}) {
        const videoDetail = await this.findByVideoId(videoFileId);

        const updateInfo = {}
        Object.keys(data).forEach(key => {
            if (Object.keys(videoDetail.dataValues).includes(key)) {
                updateInfo[key] = data[key]
            }
        });

        videoDetail.set(updateInfo);
        await videoDetail.save();

        return videoDetail;
    }

    async initToCleaningVideoDetail(videoFileId, userId, data) {
        const response = await this.updateVideoDetailWithStatus(videoFileId, userId, {
            ...data,
            status: VideoDetailStatus_Enum.cleaning.value,
            logStatus: VideoDetailStatus_Enum.init.value
        });

        return response;
    }

    async cleaningVideoDetail(videoFileId, userId, data) {
        const response = await this.updateVideoDetailWithStatus(videoFileId, userId, {
            ...data,
            logStatus: VideoDetailStatus_Enum.cleaning.value
        });

        return response;
    }

    async updateVideoDetailWithStatus(videoFileId, userId, data) {
        const response = await this.updateVideoDetail(videoFileId, userId, data);

        emitter.emit("updateVideoDetailStatus", {
            videoFileId,
            userId: userId,
            body: {
                mode: data.logStatus,
                startTime: data.userStartTimeActivity,
                endTime: data.userEndTimeActivity,
            }
        });

        return response;
    }

    async updateVideoDetail(videoFileId, userId, data) {
        const videoDetail = await this.updateMainVideoDetailInfo(videoFileId, data);
        await this.updateRelTables(videoDetail, data);

        // emitter.emit("createVideoDetailLog", {
        //     videoFileId,
        //     userId: userId,
        //     body: {
        //         mode: "update",
        //         cleaningDescription: data.cleaningDescription,
        //         startTime: data.userStartTimeActivity,
        //         endTime: data.userEndTimeActivity,
        //     }
        // });

        return (await this.detail(videoDetail.videoFileId))?.[0];
    }

    async deleteVideoDetail(id) {

        const videoDetail = await this.getById(id);
        const tempVideoDetail = videoDetail.toJSON()
        // const videoFileId = videoDetail.videoFileId;

        await videoDetail.destroy();

        // emitter.emit('deleteVideoDetail', tempVideoDetail)

        return;
    }

    async deleteVideoDetailsOfProject(projectId) {
        await VideoDetail.destroy({ where: { projectId } });
        // emitter.emit('deleteVideoDetailsByProject', projectId)

        return;
    }

    async deleteVideoDetailOfVideoFile(videoFileId) {
        await VideoDetail.destroy({ where: { videoFileId } });
        // emitter.emit('deleteVideoDetailsByProject', videoFileId)
        return;
    }

    // async createVideoDetailForVideoFile(videoFileId, userId, params) {
    //     const videoFile = await this.videoFileService.getById(videoFileId);
    //     if (!videoFile) {
    //         throw ErrorResult.notFound();
    //     }

    //     const data = { ...params }
    //     data.startTime = params.startTime ? Math.trunc(params.startTime * 1000) / 1000 : null
    //     data.endTime = params.endTime ? Math.trunc(params.endTime * 1000) / 1000 : null

    //     let newVideoDetail = await VideoDetail.create({
    //         ...data,
    //         videoFileId,
    //         projectId: videoFile.projectId,
    //         userId,
    //     });

    //     try {
    //         await this.updateVideoDetail(newVideoDetail.videoFileId, userId, data);
    //         return newVideoDetail;
    //     }
    //     catch (err) {
    //         throw ErrorResult.internal(err, "videoDetailCreatedButErrorInUpdate");
    //     }
    // }

    async findByVideoId(videoFileId) {
        return VideoDetail.findOne({ where: { videoFileId } })
    }

    async assignVideoFile(video) {
        // {id userId, originalPath, projectId = null } = video
        const { userId, projectId, duration } = video
        const videoDetail = await this.findByVideoId(video.id)
        if (videoDetail) {
            videoDetail.userId = userId
            videoDetail.projectId = projectId
            videoDetail.duration = duration
            await videoDetail.save()
        }

    }

    async newVideoDetailForVideoFile(video) {
        const { id, userId, projectId, originalName, duration, isAI } = video

        let aiTagStatus = isAI ? 'queue' : null

        const query = {
            projectId,
            videoFileId: id,
            title: originalName,
            duration,
            userId,
            isAI : TypeTool.boolean2Int(isAI),
            aiTagStatus,
            status: VideoDetailStatus_Enum.init.value
        }

        return await VideoDetail.create(query)


    }

    async updateAITagStatus(videoFileId, status) {
        const detail = await this.findByVideoId(videoFileId)
        detail.aiTagStatus = status
        await detail.save()
    }

    async updateAITags(videoFileId, tags) {
        const detail = await this.findByVideoId(videoFileId)

        // find or create tags
        const newTagsEntity = await KeywordService.findOrCreateKeywordArray(tags);

        // 3. Get existing tag relationships
        const existingRelTags = await VideoDetailRelTag.findAll({
            where: { videoFileId },
            attributes: ['tagId']
        });

        const existingTagIds = existingRelTags.map(rel => rel.tagId);
        const newTagIds = newTagsEntity.map(tag => tag.id);

        // 4. Find tags that need to be created
        const tagsToCreate = newTagIds.filter(id => !existingTagIds.includes(id));

        const inputs = await ShotInputService.get();
        const tagInput = inputs.find(item => item.valuesFrom === "tag" && item.title == "کلیدواژه های مهم");
        // const inputId = 10 // tagInput.id // 10 = کلیدواژه های مهم

        // 5. Bulk create missing relationships
        if (tagsToCreate.length > 0) {
            await VideoDetailRelTag.bulkCreate(
                tagsToCreate.map(tagId => ({
                    tagId,
                    videoFileId,
                    inputId: tagInput.id
                })),
            );
        }

        // save tags id
        detail.aiTagsId = newTagIds;
        await detail.save()


    }

    async videoDetailAiTagsList(query = { page: 1, take: 10, title }) {
        const { page, take, title } = query;

        const where = { isAI: 1, aiTagStatus: "complete" }
        if (!TypeTool.isNullUndefined(title) && title.toString().trim().length > 0) {
            where.title = { [Op.like]: `%${title}%` }
        }

        // Main query setup
        const sqlQuery = {

            attributes: ["videoFileId", "title", "aiTagsId"],

            where,

            include: [
                {
                    model: VideoDetailRelTag,
                    as: 'tagIds',
                    attributes: ["tagId", "videoFileId"],
                    required: true
                },
                {
                    model: Project,
                    as: 'project',
                    attributes: ['id', 'title'],
                    required: false
                },
                // {
                // model: VideoFile,
                // as: 'videoFile',
                // attributes: [
                //     'id', 'projectId', 'format', 'originalName', 'duration', 'size',
                //     'originalPath', 'width', 'height', 'frameRate', 'aspectRatio'
                // ],
                // required: true,
                // include: [
                //     {
                //         model: Project,
                //         attributes: ['id', 'title'],
                //         as: 'project'
                //     }
                // ]
                // }
            ],
            // subQuery: false,
            // group: ['videoFileId'] // Fully qualified column name
        };

        // Apply pagination
        const paginatedQuery = createPaginationQuery(sqlQuery, page, take);

        let { rows, count } = await VideoDetail.findAndCountAll({
            ...paginatedQuery,
            distinct: true,
        });

        for (const item of rows) {

            const aiTagsId = item.toJSON()?.aiTagsId || "[]"
            item.dataValues.aiTagsId = JSON.parse(aiTagsId)

            // delete item.dataValues.tagIds
            // delete item.dataValues.aiTagsId
        }


        return { rows, count }
    }

    async getVideoDetailTotalReport() {

        let page = 1
        let take = 100

        let tagsSum = 0
        let aiRemovedSum = 0
        let newTagsSum = 0
        let aiTagsSum = 0

        while (true) {
            // Main query setup
            const sqlQuery = {
                attributes: ["videoFileId", "title", "aiTagsId"],
                where: {
                    isAI: 1, aiTagStatus: "complete"
                },
                include: [
                    {
                        model: VideoDetailRelTag,
                        as: 'tagIds',
                        attributes: ["tagId"],
                        required: true
                    },
                ],
            };

            // Apply pagination
            const paginatedQuery = createPaginationQuery(sqlQuery, page, take);

            let { rows, count } = await VideoDetail.findAndCountAll({
                ...paginatedQuery,
                distinct: true,
            });

            if (rows.length == 0) {
                break
            }

            for (const item of rows) {
                const allTags = item.dataValues.tagIds
                const aiTags = JSON.parse(item.toJSON()?.aiTagsId || "[]")
                tagsSum += allTags.length
                newTagsSum += allTags.filter(x => !aiTags.includes(x.tagId)).length
                aiTagsSum += aiTags.length
                aiRemovedSum += aiTags.filter(x => !allTags.map(x => x.tagId).includes(x)).length
            }
            page++
        }

        return { tagsSum, newTagsSum, aiTagsSum, aiRemovedSum }
    }

    async videoDetailAiTagsReport(videoFileId) {
        const videoFileDetail = await this.findByVideoId(videoFileId)
        const videoUrl = `${appConfigs.APP_URL}/api/videoFile/show/${videoFileId}`;
        const aiTagsId = videoFileDetail.aiTagsId ? JSON.parse(videoFileDetail.aiTagsId) : []
        const detailTagsId = (await VideoDetailRelTag.findAll({ where: { videoFileId } }))?.map(x => +x.tagId) || []
        const allTags = await KeywordService.getKeywordByIds(detailTagsId)
        const aiTags = await KeywordService.getKeywordByIds(aiTagsId)

        return { allTags, aiTags, videoUrl }
    }

    async firstVideoDetailForAIByStatus(status = 'queue', withRelation = true) {

        let sqlQuery = {
            where: { aiTagStatus: status, isAI: 1 },
            order: [['createdAt', 'ASC']],
            include: withRelation ? [
                {
                    model: VideoFile,
                    attributes: ['id', 'path', 'name'],
                    as: 'videoFile',
                    required: true,
                    where: { status: [3, 4] } // converted video
                },
            ] : []
        };

        return await VideoDetail.findOne(sqlQuery)

    }

    async checkFirstQueueForAI() {
        const pending = await this.checkFirstPendingForAI()
        if (pending) {
            return null
        }

        return await this.firstVideoDetailForAIByStatus('queue')
    }

    async checkFirstPendingForAI(withRelation = true) {
        return await this.firstVideoDetailForAIByStatus('pending', withRelation)
    }

    async makeVideoDetailFromVideo(video, status = VideoDetailStatus_Enum.accept.value) {
        await VideoDetail.create({ videoFileId: video.id, title: video.originalName })
        await this.updateStatus({ videoFileId: video.id, status })
    }

    async updateStatus({ videoFileId, status = null, cleaningDescription = null }) {
        let videoDetail = await this.findByVideoId(videoFileId)

        const shotVideoStatus = await this.shotService.getShotVideoFileStatus(videoFileId);
        let shotStatus = VideoDetailShotStatus_Enum.initCheck.value;
        if (shotVideoStatus.length) {
            if (shotVideoStatus.includes(VideoDetailShotStatus_Enum.initCheck.value)) {
                shotStatus = VideoDetailShotStatus_Enum.initCheck.value;
            } else if (shotVideoStatus.includes(VideoDetailShotStatus_Enum.editor.value)) {
                shotStatus = VideoDetailShotStatus_Enum.editor.value;
            } else if (shotVideoStatus.includes(VideoDetailShotStatus_Enum.equalizing.value)) {
                shotStatus = VideoDetailShotStatus_Enum.equalizing.value;
            } else {
                shotStatus = VideoDetailShotStatus_Enum.equalized.value;
            }
        }

        if (videoDetail) {
            if (status) videoDetail.status = status
            if (cleaningDescription) videoDetail.cleaningDescription = cleaningDescription
            videoDetail.shotStatus = shotStatus;
            await videoDetail.save()
        }
        return videoDetail
    }

    async updateRelTables(videoDetail, params) {
        const data = { ...params }

        await this.createDefaultValue(data);
        await this.updateVideoDetailCategories(videoDetail.videoFileId, data);
        await this.updateVideoDetailTag(videoDetail.videoFileId, data);
        await this.updateVideoDetailTagInVideo(videoDetail.videoFileId, data);
        videoDetail = await this.updateVideoDetailLanguage(videoDetail, data);
        videoDetail = await this.updateVideoDetailGallery(videoDetail, data);
    }

    async updateVideoDetailGallery(videoDetail, data) {
        const { imgGallery } = data;

        const timeOfImg = imgGallery ? imgGallery.map(item => item.time) : [];

        let oldGallery = [];
        if (videoDetail.gallery) {
            oldGallery = JSON.parse(videoDetail.gallery);
        }

        const existTime = oldGallery.map(item => item.time);

        const newTimes = timeOfImg.filter(item => !existTime.includes(item));

        const notChangeImgs = oldGallery.filter(item => timeOfImg.includes(item.time));
        const mustRemoveImgs = oldGallery.filter(item => !timeOfImg.includes(item.time));

        const video = await this.videoFileService.getById(videoDetail.videoFileId);

        const galleryPath = path.join("gallery", videoDetail.videoFileId.toString());
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
        let timeOfMainImg = imgGallery?.findIndex(item => item.mainImg) || -1;
        if (timeOfMainImg === -1) {
            timeOfMainImg = 0;
        }

        newGalleryArr = newGalleryArr.map((item, index) => ({
            ...item,
            mainImg: timeOfMainImg === index
        }))

        videoDetail.gallery = JSON.stringify(newGalleryArr);
        await videoDetail.save();

        return videoDetail;
    }

    async updateVideoDetailLanguage(videoDetail, data, otherInfo = {}) {
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
                    videoDetail[languageTypes[i].inShot] = null;
                }
                else {
                    videoDetail[languageTypes[i].inShot] = languageIds.length === 0 ? 0 : 1;

                    const dataToInsert = languageIds.map(item => ({
                        videoFileId: videoDetail.videoFileId,
                        languageId: item,
                        type: languageTypes[i].key
                    }))

                    await VideoDetailRelLanguage.destroy({ where: { videoFileId: videoDetail.videoFileId, type: languageTypes[i].key } });
                    await VideoDetailRelLanguage.bulkCreate(dataToInsert);
                }
            }
        }

        await videoDetail.save({ transaction });

        return videoDetail;
    }

    async updateVideoDetailCategories(videoFileId, data = {}, more = {}) {
        const { categoriesId } = data;

        if (TypeTool.isNullUndefined(categoriesId)) {
            return;
        }

        const { transaction = null } = more;
        if (Array.isArray(categoriesId)) {
            await VideoDetailRelCategory.destroy({ where: { videoFileId } }, { transaction });
            await VideoDetailRelCategory.bulkCreate(categoriesId.map(item => ({ videoFileId, categoryId: item })), { transaction });
        }
    }

    async updateVideoDetailTag(videoFileId, data = {}, more = {}) {
        /* tagInput [{inputId: 1, tagIds: []}] */
        const { tagInput } = data;
        if (TypeTool.isNullUndefined(tagInput)) {
            return;
        }
        const { transaction = null } = more;

        let changedTags = [];
        const inputIds = tagInput.map(item => item.inputId);
        const tagsRemoved = await VideoDetailRelTag.findAll({ where: { videoFileId, inputId: inputIds, inVideo: 0 } }, { transaction })
        changedTags = tagsRemoved.map(item => item.tagId)

        await VideoDetailRelTag.destroy({ where: { videoFileId, inputId: inputIds, inVideo: 0 } }, { transaction });

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
                    videoFileId,
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
        const videoDetailTags = await VideoDetailRelTag.bulkCreate(bulkData, { transaction });

        changedTags = [...new Set([...changedTags])]
        await KeywordService.updateTagCount(changedTags)

        return videoDetailTags
    }

    async updateVideoDetailTagInVideo(videoFileId, data, more = {}) {
        /* tagInVideo [{tagId: 1, times: TagInVideoDetail_VO}] */
        const { tagInVideo } = data;
        if (TypeTool.isNullUndefined(tagInVideo)) {
            return;
        }

        const { transaction = null } = more;
        await VideoDetailRelTag.destroy({ where: { videoFileId, inputId: null, inVideo: 1 } }, { transaction });

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
                videoFileId,
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

        await VideoDetailRelTag.bulkCreate(bulkData, { transaction });

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
        await VideoDetail.destroy({
            where: {
                projectId
            }
        })

    }

    async specialVideoDetailList(filters = {}) {
        const {
            id = null,
            excludesId = null,
            page = null,
            take = null,
            tagId = null,
            categoryId = null,
            ownerId = null,
            inputIds = [],
            tagInVideo = false,
            search = "",
            pictureDescription = "",
            ...otherFilters
        } = filters;

        const currentSearch = [
            "userId", "videoFileId", "startDate", "hasCameraShake", "hasLogo", "hasMusic", "isArchive",
            "projectId", "soundQuality", "color", "pictureEnvironment", "soundQuality", "ageRangeDefaultValueId",
            "dayNight", "qualityGrade", "pictureViewId", "pictureModeId", "pictureTypeId",
            "gender", "status", "shotStatus"
        ]

        const languageSearchKey = ["mainLanguage", "dubbed", "subtitle", "narration"];

        let sqlQuery = {
            where: {},
            order: [['updatedAt', 'DESC']],
            include: [
                {
                    model: VideoDetailRelTag,
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

        if (id) sqlQuery.where.videoFileId = id;
        if (ownerId) sqlQuery.where.ownerId = ownerId;
        if (excludesId) sqlQuery.where.videoFileId = { [Op.notIn]: excludesId };
        if (TypeTool.boolean(pictureDescription)) {
            sqlQuery.where.pictureDescription = { [Op.like]: `%${TypeTool.string(pictureDescription).trim()}%` };
        }
        if (TypeTool.boolean(search)) {
            sqlQuery.where.title = { [Op.like]: `%${TypeTool.string(search).trim()}%` };
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
                    model: VideoDetailRelLanguage,
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
            });
        }

        if (tagId) {
            const whereInTag = {
                tagId,
                inVideo: TypeTool.boolean(tagInVideo) ? 1 : 0
            }

            if (Array.isArray(inputIds) && inputIds) {
                whereInTag.inputId = inputIds
            }

            sqlQuery.include.push({
                model: VideoDetailRelTag,
                where: whereInTag,
                as: 'tagIds'
            })
        }

        sqlQuery = createPaginationQuery(sqlQuery, page, take);

        const videoDetails = await VideoDetail.findAll({
            distinct: true,
            ...sqlQuery
        });
        
        let count = await TableCountService.getTableCountFromRedis(VideoDetail, sqlQuery);
        if(count === null){
            count =  await VideoDetail.count({
                distinct: true,
                ...sqlQuery
            });
            await TableCountService.storeTableCountInRedis(VideoDetail, sqlQuery, count);
        }

        return { videoDetails, count };
    }

    async updateVideoDetailStatus_Service(videoFileId, isExcludeMode, filters = {}, status) {
        let videoDetailsId = [];
        if (isExcludeMode) {
            let { videoDetails, count } = await this.specialVideoDetailList({ ...filters, excludesId: videoFileId });
            videoDetailsId = videoDetails.map(item => item.videoFileId);
        }
        else {
            let { videoDetails, count } = await this.specialVideoDetailList({ id: videoFileId });
            videoDetailsId = videoDetails.map(item => item.videoFileId);
        }

        await VideoDetail.update({ status }, { where: { videoFileId: videoDetailsId } });

        return;
    }

    async updateVideoDetailScores_Service(userId, videoFileId, isExcludeMode, filters = {}, scores) {
        let videoDetailsId = [];
        if (isExcludeMode) {
            let { videoDetails, count } = await this.specialVideoDetailList({ ...filters, excludesId: videoFileId });
            videoDetailsId = videoDetails.map(item => item.videoFileId);
        }
        else {
            let { videoDetails, count } = await this.specialVideoDetailList({ id: videoFileId });
            videoDetailsId = videoDetails.map(item => item.videoFileId);
        }

        console.log({ userId, videoDetailsId, scores })

        await this.videoDetailScoreService.storeScoreGroup(userId, videoDetailsId, scores)

        return;
    }

    async getExportInfoVideos({ videos: videosId, isExcludeMode, filters = {} }) {

        let videosDetails;
        if (isExcludeMode) {
            videosDetails = (await this.specialVideoDetailList({ ...filters, excludesId: videosId, page: 1, take: null }))?.videoDetails || []
        } else {
            videosDetails = await VideoDetail.findAll({
                where: { videoFileId: videosId }, include: [{
                    model: VideoFile,
                    attributes: ['id', 'size', 'duration'],
                    as: 'videoFile'
                }]
            })
        }


        let result = {
            videoSize: 0,
            videoDuration: 0,
        }

        let tempVideosId = []

        for (const videoDetail of videosDetails) {
            const { videoFile } = videoDetail.toJSON()

            if (videoFile && !tempVideosId.includes(videoFile.id)) {
                result.videoSize += (videoFile ? +videoFile.size : 0)
                result.videoDuration += (videoFile ? +videoFile.duration : 0)

                tempVideosId.push(videoFile.id)
            }

        }
        return result
    }

    async generateFilterListLink(filters){
        const UUID = uuidv4();
        const key = `video_detail_list_${UUID}`
        await redis.set(key, JSON.stringify(filters));
        await redis.expire(key, 60 * 60 * 24 * 2);

        return `${appConfigs.WEBAPP_URL}/video-detail/list/with-link/${UUID}`
    }

    async getVideoListWithCode(UUID, newFilters = {}) {
        const { page, take } = newFilters

        const key = `video_detail_list_${UUID}`
        let checkRedis = await redis.get(key);
        if(!checkRedis) return ErrorResult.badRequest("لینک اشتباه است");
        const filters = JSON.parse(checkRedis);

        return this.specialVideoDetailList({...filters, page, take })
    }

    async validateCodeWithVideoId(videoDetailId, UUID) {
        const key = `video_detail_list_${UUID}`;
        let checkRedis = await redis.get(key);
        if(!checkRedis) return ErrorResult.badRequest("لینک اشتباه است");
        const filters = JSON.parse(checkRedis);

        let check = await this.specialVideoDetailList({...filters, id: videoDetailId });
        if(!check || !check.videoDetails || check.videoDetails.length === 0){
            throw ErrorResult.forbidden()
        }
        const response = await this.detail(videoDetailId);
        return response?.[0]
    }
}

module.exports = VideoDetailService;
