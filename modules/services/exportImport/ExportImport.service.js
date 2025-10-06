const path = require('path')
const fs = require('fs');
const fsPromise = require('fs').promises;

const {
    Project,
    ShotScore,
    Category,
    Language,
    VideoDetail,
    VideoDetailRelTag,
    VideoDetailRelLanguage,
    VideoFile,
    Shot,
    ShotRelTag,
    ShotRelLanguage,
    Tag,
    VideoDetailScore,
} = require("../../_default/model");
const Service = require("../../_default/service");

const GalleryParser = require('../../../helper/galleryParser.tool');
const KeywordService = require('../keyword/Keyword.service');
const { encryptFile, decryptFile } = require('../../../helper/fileEncryption.tool');
const CategoryService = require('../category/Category.service');
const ShotInputService = require('../shotList/ShotInput.service');
const ShotDefaultValueService = require('../shotList/ShotDefaultValue.service');
const { projectService } = require('../project/index');
const LanguageService = require('../language/Language.service');
const VideoDetailEntity = require('../../entity/videoDetail/VideoDetail.entity');

class ExportImportService extends Service {

    constructor(
        ShotLogService = () => { },
        ShotService = () => { },
        EqualizerService = () => { },
        VideoDetailLogService = () => { },
        VideoDetailService = () => { }
    ) {
        super(Project);
        this.shotLogService = ShotLogService;
        this.shotService = ShotService;
        this.equalizerService = EqualizerService;
        this.videoDetailLogService = VideoDetailLogService;
        this.videoDetailService = VideoDetailService;

        // this.folderToStore = "shotDetailExport"
        this.folderToStore = "excel"
        this.fullPathToStore = path.join(__dirname, '..', '..', '..', appConfigs.STORE_FOLDER_FROM_APP_ROOT, this.folderToStore);
        if (!fs.existsSync(this.fullPathToStore)) {
            fs.mkdirSync(this.fullPathToStore, { recursive: true });
        }
    }

    async exportFullDataWithProject(projectIds) {
        const languages = (await Language.findAll({ attributes: ['id', 'name', 'UUID'] })).map(item => item.toJSON())

        const dv = await this.shotService.getBasicInfoForShot();
        const inputs = dv.inputs;
        const defaultValues = dv.defaultValue;
        const owners = dv.owners;

        let exportVideo = [];
        let exportGallery = [];

        const setLanguage = (data, hasKey, key) => {
            if (data[hasKey] === true) {
                return data.languageIds.filter(item => item.type === key).map(item => {
                    return languages.find(la => la.id == item.languageId).UUID;
                })
            } else if (data[hasKey] === false) {
                return [];
            } else {
                return null;
            }
        }

        const reformatData = async (data) => {
            let tagIds = [];
            data.forEach(it => tagIds = [...tagIds, ...it.tagIds.map(it => it.tagId)]);
            tagIds = [...new Set(tagIds)];

            let tags = await KeywordService.getTagsByIds(tagIds);
            tags = tags.map(it => ({ id: it.id, tag: it.tag, UUID: it.UUID }));

            for (let i = 0; i < data.length; i++) {
                data[i].gallery = GalleryParser(data[i].gallery);
                data[i].mainLanguages = setLanguage(data[i], "hasMainLang", "mainLanguage");
                data[i].dubbedLanguages = setLanguage(data[i], "hasDubbed", "dubbed");
                data[i].subtitleLanguages = setLanguage(data[i], "hasSubtitle", "subtitle");
                data[i].narrationLanguages = setLanguage(data[i], "hasNarration", "narration");

                data[i].soundQuality = defaultValues.soundQuality.find(item => item.value == data[i].soundQuality);
                data[i].color = defaultValues.color.find(item => item.value == data[i].color);
                data[i].pictureEnvironment = defaultValues.pictureEnvironment.find(item => item.value == data[i].pictureEnvironment);
                data[i].ageRangeDefaultValueId = defaultValues.ageRange.find(item => item.id == data[i].ageRangeDefaultValueId);
                data[i].dayNight = defaultValues.dayNight.find(item => item.value == data[i].dayNight)
                data[i].pictureViewId = defaultValues.pictureView.find(item => item.id == data[i].pictureViewId)
                data[i].pictureTypeId = defaultValues.pictureType.find(item => item.id == data[i].pictureTypeId)
                data[i].pictureModeId = defaultValues.pictureMode.find(item => item.id == data[i].pictureModeId)
                data[i].ownerId = owners.find(item => item.id == data[i].ownerId)

                exportGallery = [...exportGallery, ...data[i].gallery.map(item => `${item.path}/${item.fileName}`)];
                if (data[i].videoFile.path && data[i].videoFile.name) {
                    exportVideo = [...exportVideo, {
                        orgFile: `${data[i].videoFile.path}/${data[i].videoFile.name}`,
                        storeIn: `${data[i].projectId}/${data[i].videoFile.originalPath}/${data[i].videoFile.name}`,
                    }];
                }

                data[i].tags = data[i].tagIds.map(item => {
                    const tag = tags.find(it => it.id === item.tagId);
                    const input = inputs.find(it => it.id === item.inputId);
                    return { tagUUID: tag.UUID, input: input.title }
                });

                data[i].category = data[i].category.map(item => item.UUID)

                delete data[i].hasMainLang;
                delete data[i].hasDubbed;
                delete data[i].hasSubtitle;
                delete data[i].hasNarration;
                delete data[i].languageIds;
                delete data[i].tagIds;
            }
            return { data, tags };
        }

        const categories = (await Category.findAll({ attributes: ['id', 'name', 'UUID'] })).map(item => item.toJSON())
        const projects = await Project.findAll({ where: { id: projectIds } })

        let fullTags = [];

        let videoDetails = await this.getVideoDetailByProjectId(projectIds)
        let response = await reformatData(videoDetails);
        videoDetails = response.data;
        fullTags = response.tags;

        let shots = await this.getShotDetailByProjectId(projectIds)
        response = await reformatData(shots);
        shots = response.data;
        fullTags = [...fullTags, ...response.tags];

        const dataToStore = {
            categories,
            languages,
            tags: fullTags,
            projects,
            videoDetails,
            shots,
        }

        const pathToStore = path.join(appConfigs.BASE_PATH, process.env.STORE_FOLDER_FROM_APP_ROOT, "export_full_data");
        fs.mkdirSync(pathToStore, { recursive: true });

        const now = Date.now();
        const encFile = `${now}.enc`;
        const fileName = `${now}.json`;
        const galleryFileName = `gallery_${now}.json`;
        const videoFileName = `video_${now}.json`;

        const pathToFile = path.join(pathToStore, fileName);
        const pathToVideoFile = path.join(pathToStore, videoFileName);
        const pathToGalleryFile = path.join(pathToStore, galleryFileName);

        await fs.writeFileSync(pathToFile, JSON.stringify(dataToStore));
        await fs.writeFileSync(pathToVideoFile, JSON.stringify(exportVideo));
        await fs.writeFileSync(pathToGalleryFile, JSON.stringify(exportGallery));

        await encryptFile(pathToFile, path.join(pathToStore, encFile));
        // await fs.unlinkSync(pathToFile);

        return {
            data: this.generateDownloadLink(`export_full_data/${encFile}`),
            gallery: this.generateDownloadLink(`export_full_data/${galleryFileName}`),
            video: this.generateDownloadLink(`export_full_data/${videoFileName}`),
        }
    }

    async getVideoDetailByProjectId(projectIds) {
        let videos = await VideoDetail.findAll({
            where: { projectId: projectIds },
            include: [
                { model: Category, attributes: ['id', 'name', 'UUID'], as: 'category' },
                { model: VideoDetailRelTag, as: 'tagIds' },
                { model: VideoDetailRelLanguage, as: 'languageIds' },
                { model: VideoDetailScore, as: 'score', attributes: ["scoreKey", "score", "section"], where: { section: "shot-main-score" } },
                {
                    model: VideoFile,
                    attributes: [
                        'id', 'projectId', 'format', 'originalName', 'duration', 'size', 'name', 'path',
                        'originalPath', 'width', 'height', 'frameRate', 'aspectRatio', "UUID", "fullInfo", "bitrate"
                    ],
                    as: 'videoFile',
                },
            ],
        });
        if (!videos?.length) {
            return []
        }
        videos = videos.map(x => x.toJSON());
        return videos;
    }

    async getShotDetailByProjectId(projectIds) {
        let shots = await Shot.findAll({
            where: { projectId: projectIds },
            include: [
                { model: Category, attributes: ['id', 'name', "UUID"], as: 'category' },
                { model: ShotRelTag, as: 'tagIds' },
                { model: ShotRelLanguage, as: 'languageIds' },
                { model: VideoFile, as: 'videoFile', attributes: ["UUID"] },
                { model: ShotScore, as: 'score', attributes: ["scoreKey", "score", "section"], where: { section: "shot-main-score" } },
            ],
        });
        if (!shots?.length) {
            return []
        }
        shots = shots.map(x => x.toJSON());

        return shots;
    }

    async saveFullDataImportFile(req) {
        return new Promise(async (resolve, reject) => {

            const { file: excelFile, ...fields } = req.body

            try {
                const file = excelFile?.toBuffer()
                const originalFilename = excelFile?.filename
                const pathToStore = path.join(appConfigs.BASE_PATH, process.env.STORE_FOLDER_FROM_APP_ROOT, "import_full_data");
                if (!fs.existsSync(pathToStore)) {
                    fs.mkdirSync(pathToStore, { recursive: true });
                }
                const newPath = path.join(pathToStore, originalFilename);
                await pump(file, fs.createWriteStream(newPath));
                
                return resolve({ originalFilename, newPath });

            } catch (error) {
                return reject(err);
            }

            // formData.parse(req, async function (err, fields, files) {
            //     try {
            //         const file = files.file[0];
            //         const oldPath = file.filepath;
            //         const originalFilename = file.originalFilename;

            //         const pathToStore = path.join(appConfigs.BASE_PATH, process.env.STORE_FOLDER_FROM_APP_ROOT, "import_full_data");
            //         fs.mkdirSync(pathToStore, { recursive: true });

            //         const newPath = path.join(pathToStore, originalFilename);
            //         await fs.copyFileSync(oldPath, newPath);

            //         return resolve({ originalFilename, newPath });
            //     }
            //     catch (err) {
            //         return reject(err);
            //     }
            // });
        })
    }

    async importFullDataFile(fileName, filePath) {
        const pathToStore = path.join(appConfigs.BASE_PATH, process.env.STORE_FOLDER_FROM_APP_ROOT, "import_full_data");
        const output = path.join(pathToStore, `${Math.floor(Math.random() * 100000000)}.json`);
        await decryptFile(filePath, output);
        const data = await fsPromise.readFile(output, 'utf8').then(data => JSON.parse(data));

        const projects = await projectService.checkAndUpdateWithUUID(data.projects);
        const tags = await KeywordService.checkAndUpdateWithUUID(data.tags);
        const categories = await CategoryService.checkAndUpdateWithUUID(data.categories);
        const languages = await LanguageService.checkAndUpdateWithUUID(data.languages);

        const videoDetailIds = await this.importFullDataVideoFromOtherServer({ projects, tags, categories, languages }, data.videoDetails);
        await this.importShotFullDataFromOtherServer({ projects, tags, categories, languages }, videoDetailIds, data.shots);

        await KeywordService.updateTagCount(tags.map(item => item.id))

        return {};
    }

    async importFullDataVideoFromOtherServer(basicInfo, data) {
        const { projects } = basicInfo;

        let videoDetailIds = [];
        for (let i = 0; i < data.length; i++) {

            const oldId = data[i].videoFileId;
            const videoDetailData = data[i];
            const videoFileData = videoDetailData.videoFile;
            const project = projects.find(item => item.oldId == videoFileData.projectId);

            videoFileData.projectId = project.id;
            const response = await this.findOrCreateVideoFileFromImportData(videoFileData);
            videoDetailData.userId = null;
            videoDetailData.videoFileId = response.id;
            videoDetailData.projectId = project.id;

            await this.findOrCreateVideoDetailFromImportData(videoDetailData, basicInfo);

            videoDetailIds.push({
                oldId,
                newId: response.id,
                newProjectId: project.id
            })
        }

        return videoDetailIds;
    }

    async findOrCreateVideoFileFromImportData(data) {
        const response = { isNew: false, updatedData: [], id: null, oldId: data.id };
        delete data.id;

        let videoFile = await VideoFile.findOne({ where: { UUID: data.UUID } });
        if (!videoFile) {
            response.isNew = true;
            data.status = 6;
            videoFile = await VideoFile.create(data);
            response.id = videoFile.id;
        } else {
            response.id = videoFile.id;
            videoFile = await VideoFile.update({ ...data }, { where: { UUID: data.UUID } });
        }

        return response
    }

    async findOrCreateVideoDetailFromImportData(data, basicInfo) {
        delete data.videoFile;

        const {
            tags,
            categories,
            languages,
        } = basicInfo;

        let videoDetail = await VideoDetail.findOne({ where: { videoFileId: data.videoFileId } });
        if (!videoDetail) {
            videoDetail = await VideoDetail.create({
                videoFileId: data.videoFileId,
                projectId: data.projectId,
                title: data.title,
            });
        }

        // * @TODO: detect change and get confirm from admin */  
        Object.keys(data).forEach(key => videoDetail[key] = data[key])

        videoDetail.ownerId = null;
        videoDetail.gallery = JSON.stringify(data.gallery.map(item => { delete item.url; return item; }));

        videoDetail = await this.createOrSetDefaultValue(data, videoDetail, "soundQuality", "value");
        videoDetail = await this.createOrSetDefaultValue(data, videoDetail, "color", "value");
        videoDetail = await this.createOrSetDefaultValue(data, videoDetail, "pictureEnvironment", "value");
        videoDetail = await this.createOrSetDefaultValue(data, videoDetail, "dayNight", "value");
        videoDetail = await this.createOrSetDefaultValue(data, videoDetail, "pictureModeId", "id");
        videoDetail = await this.createOrSetDefaultValue(data, videoDetail, "pictureViewId", "id");
        videoDetail = await this.createOrSetDefaultValue(data, videoDetail, "pictureTypeId", "id");
        videoDetail = await this.createOrSetDefaultValue(data, videoDetail, "ageRangeDefaultValueId", "id");

        await videoDetail.save();

        /* Insert Categories */
        if (data.category && data.category.length > 0) {
            data.category = categories.filter(it => data.category.includes(it.UUID)).map(item => item.id)
        }
        await this.videoDetailService.updateVideoDetailCategories(videoDetail.videoFileId, { categoriesId: data.category });

        /* Insert Tags */
        data.tags = data.tags.map(item => {
            const tag = tags.find(it => it.UUID === item.tagUUID);
            return { ...item, tagId: tag.id }
        })

        const tagsToInsert = await this.generateTagToInsert(data);
        await this.videoDetailService.updateVideoDetailTag(videoDetail.videoFileId, { tagInput: tagsToInsert });

        /* Insert Languages */
        const setLanguages = (UUIDs) => {
            if (UUIDs === null) return [0];
            return UUIDs.map(item => languages.find(it => it.UUID === item).id)
        }

        data.mainLanguages = setLanguages(data.mainLanguages)
        data.dubbedLanguages = setLanguages(data.dubbedLanguages)
        data.subtitleLanguages = setLanguages(data.subtitleLanguages)
        data.narrationLanguages = setLanguages(data.narrationLanguages)

        const dataLanguage = await this.findAndSetLanguages(data, videoDetail);
        await this.videoDetailService.updateVideoDetailLanguage(videoDetail, dataLanguage);

        /* Insert Score */
        const section = 'shot-main-score'
        for (let i = 0; i < data.score.length; i++) {
            const score = data.score[i];
            const findScore = await VideoDetailScore.findOne({
                where: { videoFileId: videoDetail.videoFileId, scoreKey: score.scoreKey, section }
            });

            if (!findScore) {
                await VideoDetailScore.create({ videoFileId: videoDetail.videoFileId, scoreKey: score.scoreKey, score: score.score, section })
            } else {
                await VideoDetailScore.update({ score: score.score }, { where: { videoFileId: videoDetail.videoFileId, scoreKey: score.scoreKey, section } })
            }
        }

    }

    async importShotFullDataFromOtherServer(basicInfo, videoDetails, shots) {
        const {
            tags,
            categories,
            languages,
        } = basicInfo;

        for (let i = 0; i < shots.length; i++) {
            const shotData = shots[i];
            const videoFile = videoDetails.find(item => item.oldId == shotData.videoFileId);
            shotData.userId = null;
            shotData.videoFileId = videoFile.newId;
            shotData.projectId = videoFile.newProjectId;

            let shot = await Shot.findOne({ where: { UUID: shotData.UUID } });
            if (!shot) {
                shot = await Shot.create({
                    videoFileId: shotData.videoFileId,
                    projectId: shotData.projectId,
                    title: shotData.title,
                    UUID: shotData.UUID,
                });
            }

            // * @TODO: detect change and get confirm from admin */  
            Object.keys(shotData).forEach(key => shot[key] = shotData[key])

            shot.ownerId = null;
            shot.gallery = JSON.stringify(shotData.gallery.map(item => { delete item.url; return item; }));

            shot = await this.createOrSetDefaultValue(shotData, shot, "soundQuality", "value");
            shot = await this.createOrSetDefaultValue(shotData, shot, "color", "value");
            shot = await this.createOrSetDefaultValue(shotData, shot, "pictureEnvironment", "value");
            shot = await this.createOrSetDefaultValue(shotData, shot, "dayNight", "value");
            shot = await this.createOrSetDefaultValue(shotData, shot, "pictureModeId", "id");
            shot = await this.createOrSetDefaultValue(shotData, shot, "pictureViewId", "id");
            shot = await this.createOrSetDefaultValue(shotData, shot, "pictureTypeId", "id");
            shot = await this.createOrSetDefaultValue(shotData, shot, "ageRangeDefaultValueId", "id");

            await shot.save();

            /* Insert Categories */
            if (shotData.category && shotData.category.length > 0) {
                shotData.category = categories.filter(it => shotData.category.includes(it.UUID)).map(item => item.id)
            }
            await this.shotService.updateShotCategories(shot.id, { categoriesId: shotData.category });

            /* Insert Tags */
            shotData.tags = shotData.tags.map(item => {
                const tag = tags.find(it => it.UUID === item.tagUUID);
                return { ...item, tagId: tag.id }
            })
            const tagsToInsert = await this.generateTagToInsert(shotData);
            await this.shotService.updateShotTag(shot.id, { tagInput: tagsToInsert });

            /* Insert Languages */
            const setLanguages = (UUIDs) => {
                if (UUIDs === null) return [0];
                return UUIDs.map(item => languages.find(it => it.UUID === item).id)
            }

            shotData.mainLanguages = setLanguages(shotData.mainLanguages)
            shotData.dubbedLanguages = setLanguages(shotData.dubbedLanguages)
            shotData.subtitleLanguages = setLanguages(shotData.subtitleLanguages)
            shotData.narrationLanguages = setLanguages(shotData.narrationLanguages)

            const dataLanguage = await this.findAndSetLanguages(shotData, shot);
            await this.shotService.updateShotLanguage(shot, dataLanguage);

            /* Insert Score */
            const section = 'shot-main-score'
            for (let i = 0; i < shotData.score.length; i++) {
                const score = shotData.score[i];
                const findScore = await ShotScore.findOne({
                    where: { shotId: shot.id, scoreKey: score.scoreKey, section }
                });

                if (!findScore) {
                    await ShotScore.create({ shotId: shot.id, scoreKey: score.scoreKey, score: score.score, section })
                } else {
                    await ShotScore.update({ score: score.score }, { where: { shotId: shot.id, scoreKey: score.scoreKey, section } })
                }
            }
        }
    }

    async createOrSetDefaultValue(data, valid, key, returnKey) {
        if (data?.[key]) {
            valid[key] = (await ShotDefaultValueService.checkAndCreateDefaultValue({
                section: data?.[key].section,
                key: data?.[key].key,
                value: data?.[key].value,
            }))[0][returnKey];
        }

        return valid;
    }

    async generateTagToInsert(data) {
        const inputsText = [...new Set(data.tags.map(item => item.input))];
        const inputs = await ShotInputService.findOrCreate(inputsText.map(item => ({ title: item, type: "multiSelect", valuesFrom: "tag" })))
        const tagsToInsert = inputs.map(item => {
            let tagIds = data.tags.filter(it => item.title === it.input).map(item => item.tagId)
            return { inputId: item.id, tagIds };
        })

        return tagsToInsert;
    }

    async findAndSetLanguages(data, modalData) {
        modalData.hasMainLang = data.mainLanguages === null ? null : (data.mainLanguages.length > 0);
        modalData.hasDubbed = data.dubbedLanguages === null ? null : (data.dubbedLanguages.length > 0);
        modalData.hasSubtitle = data.subtitleLanguages === null ? null : (data.subtitleLanguages.length > 0);
        modalData.hasNarration = data.narrationLanguages === null ? null : (data.narrationLanguages.length > 0);

        let dataLanguage = {
            mainLanguage: data.mainLanguages,
            dubbed: data.dubbedLanguages,
            subtitle: data.subtitleLanguages,
            narration: data.narrationLanguages,
        }

        return dataLanguage;
    }
}

module.exports = ExportImportService;
