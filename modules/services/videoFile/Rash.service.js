const RashGateway = require("../../../gateway/Rash.gateway")
const Service = require("../../_default/service")

const fs = require('fs')
const path = require('path');
const KeywordService = require("../keyword/Keyword.service");
const { ExportRushLog, sequelize } = require("../../_default/model");
const Redis = require("../../../db/redis")

class RashService extends Service {

    constructor(
        ExportVideoService = () => { },
        ShotService = () => { }
    ) {
        super();
        this.ExportVideoService = ExportVideoService;
        this.ShotService = ShotService;
    }

    getRootDir() {
        return path.join(__dirname, "..", "..", "..");
    }

    async findByExportId(exportId) {
        return ExportRushLog.findAll({ where: { exportId } })
    }

    async findTypes(exportId, types = []) {
        return ExportRushLog.findAll({ where: { exportId, type: types, status: 'ok' } })
    }

    async createLog({ exportId, objectId, type, status, log }) {
        return ExportRushLog.create({ exportId, objectId, type, status, log: JSON.stringify(log) })
    }

    async setExportFile2Queue(exportId) {
        const exportFile = await this.ExportVideoService.getById(exportId)
        await this.ExportVideoService.updateProductStatusByCode(exportFile.productId, exportFile.code, 'queue');
    }

    async GetAndSendDataByExportId(exportId, force = false) {
        /* check export video is only rebuild or send to site */
        const checkRedisToNotSend = await this.ExportVideoService.checkAndRemoveOnlyReBuildStudio(exportId);
        if (checkRedisToNotSend) return;

        const exportDetails = (await this.ExportVideoService.findAllDetailByExportId(exportId)).map(item => item.toJSON());
        if (!exportDetails?.[0]) return exportId

        const { productId, isProduct, code: exportCode, productStatus } = exportDetails[0].export;
        // if (productStatus == 'queue'){
        //     await this.ExportVideoService.updateProductStatusByCode(null, exportCode, 'pending');
        // }


        // need to update, if productId is exists 
        if (productId) {
            await this.updateProductFiles({ id: exportId, code: exportCode, productId })
            return
        }

        let shotsId = []
        const videosId = []
        for (const ex of exportDetails) {
            const { shotId, videoId } = ex
            if (shotId) shotsId.push(shotId)
            else if (videoId) videosId.push(videoId)
        }

        if (videosId.length) {
            const shotsOfVideos = await this.ShotService.getByAttribute('videoFileId', videosId)
            shotsId = [...shotsId, ...shotsOfVideos.map(x => x.toJSON()).map(x => x.id)]
        }

        if (shotsId.length == 0) return exportId

        const shotsDetail = await this.ShotService.shotsDetail(shotsId)
        const defaultValues = await this.ShotService.getBasicInfoForShot();

        // fetch and clean shot detail data
        const items = []
        for (const detail of shotsDetail) {
            const data = (await this.shotToProductData(detail, defaultValues))
            items.push(data)
        }

        // combine shots detail
        const data = this.combineShoteDetails(items)

        // files ====================
        // get thumbnail
        let mainGallery = shotsDetail.find(x => x.gallery && x.gallery.length > 0)?.gallery?.find(x => x.mainImg)
        const pathMainGallery = mainGallery ? path.join(this.getRootDir(), appConfigs.STORE_FOLDER_FROM_APP_ROOT, mainGallery.path, mainGallery.fileName) : null
        data['mainImage'] = pathMainGallery && fs.existsSync(pathMainGallery) ? pathMainGallery : null

        // get video
        data['exportVideoFile'] = this.ExportVideoService.getPathFileByCode(exportCode)
        // get gif
        const gifPath = path.join(this.ExportVideoService.getPathOfFolder(exportCode), `${exportCode}.gif`)
        data['gif'] = fs.existsSync(gifPath) ? gifPath : null;
        // =====================

        console.log(11111111111, 'data are collected for send')
        if (isProduct == 1 || force) {
            console.log(11111111111, `start send file id=${exportId}  exportCode=${exportCode}`)

            await this.SendToProduct(exportId, exportCode, data);
        }

        return exportId;
    }

    combineShoteDetails(items) {
        const combineDetail = {}
        const response = {}

        for (const item of items) {
            Object.entries(item).map(([key, value]) => {

                const type = Array.isArray(value) || value == null ? 'array' : typeof value

                if (!combineDetail[key]) {
                    if (type == 'object') {
                        combineDetail[key] = {}
                    } else {
                        combineDetail[key] = []
                    }
                }

                if (!!value) {
                    if (type == 'string' || type == 'number') {
                        combineDetail[key] = [...new Set([...combineDetail[key], value])]
                    } else if (type == 'array') {
                        combineDetail[key] = [...new Set([...combineDetail[key], ...value])]
                    } else if (type == 'object') {
                        Object.entries(value).map(([k, v]) => {
                            if (!combineDetail[key][k]) {
                                combineDetail[key][k] = v
                            }
                        })
                    }
                }

            })
        }

        Object.entries(combineDetail).map(([key, value]) => {
            if (['categories', 'languages', 'quality', 'tags', 'related_tags', 'eventTag', 'locationTag'].includes(key)) {
                response[key] = value
            } else {
                response[key] = value.join('|')
            }
        })

        return response
    }

    async SendToProduct(exportId, exportCode, data) {

        const {
            title,
            description,
            categories,
            age,
            aspectRatio,
            colorText,
            pictureEnvironmentText,
            format,
            tags,
            related_tags,
            frameRate,
            gender,
            pictureMode,
            pictureType,
            pictureView,
            languages,
            quality,
            resolution,
            dayNight,
            startDate,
            eventTag = [],
            locationTag = {},

            mainImage,
            exportVideoFile,
            gif
        } = data;

        console.log(111111, { exportId, exportCode, data })

        const findTypes = (await this.findTypes(exportId, ['videoFile', 'gif', 'thumbnail'])).map(x => x.toJSON())

        let videosId = []
        let videoID = findTypes.find(x => x.type == 'videoFile')?.objectId

        console.log(33333, { videoID })
        if (!videoID) {
            try {
                console.log(2222, exportVideoFile)
                videoID = (await RashGateway.sendFile2Product(exportVideoFile))
                videosId.push(videosId)
                await this.createLog({ exportId, objectId: videoID, type: 'videoFile', status: "ok", log: 'آپلود فایل موفقیت آمیز بود' })
            } catch (error) {
                videosId = null
                await this.ExportVideoService.updateProductStatusByCode(null, exportCode, 'error');
                await this.createLog({ exportId, objectId: null, type: 'videoFile', status: "error", log: (error.message || 'در هنگام آپلود فایل خطایی رخ داده است') })
                throw new Error("rush upload file error");
            }
        }

        let gifID = findTypes.find(x => x.type == 'gif')?.objectId;
        console.log(4444, { gifID })
        if (!gifID) {
            if (gif) {
                console.log("Send gif");
                try {
                    gifID = (await RashGateway.sendFile2Product(gif));
                    await this.createLog({ exportId, objectId: gifID, type: 'gif', status: "ok", log: 'آپلود گیف موفقیت آمیز بود' })
                } catch (error) {
                    gifID = null
                    await this.ExportVideoService.updateProductStatusByCode(null, exportCode, 'error');
                    await this.createLog({ exportId, objectId: null, type: 'gif', status: "error", log: (error.message || 'در هنگام آپلود گیف خطایی رخ داده است') })
                    throw new Error("rush upload gif error");
                }
            }
        }

        // for (const mainImage of mainImages) {
        let thumbID = findTypes.find(x => x.type == 'thumbnail')?.objectId
        console.log(55555, { thumbID })
        if (!thumbID) {
            if (mainImage) {
                console.log("Send thumbnail");
                try {
                    thumbID = (await RashGateway.sendFile2Product(mainImage));
                    await this.createLog({ exportId, objectId: thumbID, type: 'thumbnail', status: "ok", log: 'آپلود تصویر موفقیت آمیز بود' })
                } catch (error) {
                    thumbID = null
                    await this.ExportVideoService.updateProductStatusByCode(null, exportCode, 'error');
                    await this.createLog({ exportId, objectId: null, type: 'thumbnail', status: "error", log: (error.message || 'در هنگام آپلود تصویر خطایی رخ داده است') })
                    throw new Error("rush upload thumbnail error");
                }

            }
        }
        // }

        let occasionDate = null;
        let occasionTitle = [];
        let locations = {};

        if (startDate && startDate.length === 10) {
            occasionDate = startDate.replaceAll("/", "");
        }
        if (eventTag && eventTag.length > 0) {
            occasionTitle = eventTag;
        }
        if (locationTag && Object.keys(locationTag).length > 0) {
            locations = locationTag;
        }

        const attributes = {}
        if (age) attributes.ages = [age]
        if (aspectRatio) attributes.aspect_ratio = [aspectRatio]
        if (colorText) attributes.color = [colorText]
        if (pictureEnvironmentText) attributes.pictureEnvironment = [pictureEnvironmentText]
        if (format) attributes.format = [format]
        if (frameRate) attributes.frame_rate = [frameRate]
        if (gender) attributes.gender = [gender]
        if (pictureMode) attributes.image_mode = [pictureMode]
        if (pictureType) attributes.image_type = [pictureType]
        if (languages?.length) attributes.language = languages
        if (quality) attributes.quality = quality
        if (resolution) attributes.resolution = [resolution]
        if (dayNight) attributes.time = [dayNight]
        if (pictureView) attributes.view = [pictureView]

        console.log(4646464646, {
            title: title,
            content: description,
            sku: exportCode,
            categories,
            thumbID,
            gifID,
            videoID,
            related_tags,
            tags,
            attributes,
            occasionTitle,
            occasionDate,
            locations
        })
        await RashGateway.sendProduct({
            title: title,
            content: description,
            sku: exportCode,
            categories,
            thumbID,
            gifID,
            videoID,
            related_tags,
            tags,
            attributes,
            occasionTitle,
            occasionDate,
            locations
        }).then(async (response) => {
            const { productID, message } = response;
            if (!productID) {
                await this.createLog({ exportId, objectId: null, type: 'data', status: "error", log: message })
                await this.ExportVideoService.updateProductStatusByCode(null, exportCode, 'error');
                console.log(3333333333, `file with exportId=${exportId} and exportCode=${exportCode} is failed `)
                throw new Error(message);
            }
            else {
                await this.createLog({ exportId, objectId: productID, type: 'data', status: "ok", log: 'اتمام' })

                await this.ExportVideoService.updateProductStatusByCode(productID, exportCode, 'complete');

                console.log(3333333333, `file with exportId=${exportId} and exportCode=${exportCode} is completed productId=${productID} `)

            }
        }).catch(async error => {
            console.log(error)
            await this.createLog({ exportId, objectId: null, type: 'data', status: "error", log: error.message })
            await this.ExportVideoService.updateProductStatusByCode(null, exportCode, 'error');
            console.log(3333333333, `file with exportId=${exportId} and exportCode=${exportCode} is failed `)
            throw error;
        })
    }

    async shotToProductData(shotDetail, defaultValues) {
        const categoryMap = {
            "سیاسی": ["سیاسی"],
            "مذهبی": ["مذهبی"],
            "اقتصاد": ["اقتصاد"],
            "صنعت": ["صنعت"],
            "ماشین آلات صنعتی": ["صنعت"],
            "عمران": ["صنعت"],
            "ابزارآلات": ["اشیا"],
            "اشیا": ["اشیا"],
            "سازه": ["اماکن", "صنعت"],
            "معماری": ["هنر", "نمای شهری و روستایی", "اماکن"],
            "هنر": ["هنر"],
            "صنایع دستی": ["هنر"],
            "گرافیک": ["هنر"],
            "روستا": ["نمای شهری و روستایی"],
            "نمای شهری": ["نمای شهری و روستایی,"],
            "تزئینات شهری": ["نمای شهری و روستایی"],
            "ساختمان": ["نمای شهری و روستایی"],
            "دفاع مقدس": ["مقاومت و دفاع مقدس"],
            "شهدا": ["مقاومت و دفاع مقدس"],
            "مقاومت": ["مقاومت و دفاع مقدس"],
            "تجهیزات نظامی": ["نظامی"],
            "نظامی": ["نظامی"],
            "جنگ": ["جنگ"],
            "انقلاب اسلامی": ["انقلاب اسلامی"],
            "اماکن": ["اماکن"],
            "آثار باستانی": ["اماکن", "تاریخی"],
            "اماکن عمومی": ["اماکن"],
            "تفریح و سرگرمی": ["تفریح  و سرگرمی"],
            "تاریخی": ["تاریخی"],
            "تاریخ نگاری": ["تاریخی"],
            "وقایع تاریخی": ["تاریخی"],
            "وسائل نقلیه": ["حمل و نقل"],
            "حمل و نقل": ["حمل و نقل"],
            "جاده": ["حمل و نقل"],
            "ترافیک": ["حمل و نقل"],
            "خانواده": ["سبک زندگی"],
            "سبک زندگی": ["سبک زندگی"],
            "شخصیت ها": ["شخصیت ها"],
            "سخنرانی": ["شخصیت ها"],
            "مصاحبه": ["شخصیت ها"],
            "حوادث": ["حوادث"],
            "امدادرسانی": ["حوادث"],
            "غذا و نوشیدنی": ["غذا و نوشیدنی"],
            "مواد غذایی": ["غذا و نوشیدنی"],
            "آشپزی": ["غذا و نوشیدنی"],
            "طبیعت": ["طبیعت"],
            "حیوانات": ["حیوانات"],
            "کشاورزی و دامداری": ["کشاورزی و دامداری"],
            "محیط زیست": ["محیط زیست"],
            "علم و فناوری": ["علم و فناوری"],
            "چهره ها": ["مردم"],
            "مردم": ["مردم"],
            "اجتماع مردمی": ["مردم"],
            "شعار دادن": ["مردم"],
            "آداب و رسوم": ["فرهنگ"],
            "زنان": ["زنان"],
            "آموزش": ["آموزش"],
            "ورزشی": ["ورزشی"],
            "مشاغل": ["مشاغل"],
            "پزشکی و سلامت": ["پزشکی و سلامت"],
            "متفرقه": ["متفرقه"],
        }

        const tagText = (inputId) => {
            return shotDetail.allTags.filter(item => item.ShotRelTag.inputId === inputId).map(item => item.tag)
        }

        const title = shotDetail.title;
        const description = shotDetail.pictureDescription;

        let validCategories = [];
        shotDetail.category.map(x => x.name).map(item => {
            if (categoryMap[item]) {
                validCategories = [...validCategories, ...categoryMap[item]]
            }
        });

        validCategories = [...new Set(validCategories)]
        // info
        const age = defaultValues.defaultValue.ageRange.find(item => item.id == shotDetail.ageRangeDefaultValueId)?.key ?? "";

        const aspectRatio = shotDetail.videoFile.aspectRatio
        const colorText = defaultValues.defaultValue.color.find(item => item.value == shotDetail.color)?.key ?? "";
        const pictureEnvironmentText = defaultValues.defaultValue.pictureEnvironment.find(item => item.value == shotDetail.pictureEnvironment)?.key ?? "";
        const format = shotDetail.videoFile.format

        const dateEventTagInput = defaultValues.inputs.find(item => item.title === "مناسبت");
        const eventTag = tagText(dateEventTagInput.id);

        const locationEventTagInput = defaultValues.inputs.find(item => item.title === "مکان فیلم");
        const locTag = shotDetail.allTags.filter(item => item.ShotRelTag.inputId === locationEventTagInput.id);
        let locationTag = {};
        for (let i = 0; i < locTag.length; i++) {
            if (locTag[i].type !== "location") {
                locationTag[locTag[i].tag] = [];
            }
            else {
                let tag = await KeywordService.getTagDetail(locTag[i].id);
                if (!tag || !tag.location.lat || !tag.location.lng) {
                    locationTag[locTag[i].tag] = [];
                }
                else {
                    locationTag[locTag[i].tag] = [tag.location.lat, tag.location.lng];
                }
            }
        }

        const frameRate = shotDetail.videoFile.frameRate
        const gender = shotDetail.gender === null ? null : (shotDetail.gender ? "آقا" : "خانم")

        const pictureMode = defaultValues.defaultValue.pictureMode.find(item => item.id == shotDetail.pictureModeId)?.key ?? "";
        const pictureType = defaultValues.defaultValue.pictureType.find(item => item.id == shotDetail.pictureTypeId)?.key ?? "";
        const pictureView = defaultValues.defaultValue.pictureView.find(item => item.id == shotDetail.pictureViewId)?.key ?? "";
        const dayNight = defaultValues.defaultValue.dayNight.find(item => item.value == shotDetail.dayNight)?.key ?? "";

        let langIds = shotDetail.languageIds.filter(item => item.type === "mainLanguage").map(x => x.languageId);
        const languages = [...new Set(defaultValues.languages.filter(item => langIds.includes(item.id)).map(item => item.name))];

        const height = +shotDetail.videoFile.height;
        const width = +shotDetail.videoFile.width;
        const resolution = shotDetail.videoFile.width + "x" + shotDetail.videoFile.height;
        let quality = [];
        if (height >= 2160 && width >= 4096) quality.push("4K");
        if (height >= 2160 && width >= 3840) quality.push("UHD");
        if (height >= 1080) quality.push("FULL HD");
        if (height >= 720) quality.push("HD");


        let tags = [];
        defaultValues.inputs.forEach(input => tags = [...tags, ...tagText(input.id)]);
        let ageGender = gender || '';
        if (age) {
            if (ageGender.length !== 0) {
                ageGender += ` ${age}`
            }
            else {
                ageGender = age;
            }
        }

        tags = [
            ...tags,
            ...shotDetail.category.map(x => x.name),
            ageGender,
            pictureType,
            pictureMode,
            dayNight,
        ].filter(item => item?.toString()?.length > 0);

        const related_tags = shotDetail.category.map(x => x.name)

        return {
            title,
            description,
            categories: validCategories,
            age,
            aspectRatio,
            colorText,
            pictureEnvironmentText,
            format,
            tags,
            related_tags,
            frameRate,
            gender,
            pictureMode,
            pictureType,
            languages,
            quality,
            resolution,
            dayNight,
            pictureView,
            startDate: shotDetail.startDate,
            eventTag,
            locationTag,
        }

    }

    async updateProductFiles(exportData) {
        const exportCode = exportData.code;
        const exportId = exportData.id;
        const productId = exportData.productId;

        const exportVideoFile = this.ExportVideoService.getPathFileByCode(exportCode)
        const gifPath = path.join(this.ExportVideoService.getPathOfFolder(exportCode), `${exportCode}.gif`)
        const gif = fs.existsSync(gifPath) ? gifPath : null;

        let dataToSend = {}

        try {
            console.log("Send video", exportVideoFile);
            const videoID = (await RashGateway.sendFile2Product(exportVideoFile));
            console.log("Video uploaded: " + videoID);
            await this.createLog({
                exportId, objectId: videoID,
                type: 'videoFile',
                status: "ok",
                log: 'آپلود فایل موفقیت آمیز بود'
            })

            dataToSend = { videoID }
        } catch (error) {
            await this.ExportVideoService.updateProductStatusByCode(null, exportCode, 'error');

            await this.createLog({
                exportId,
                objectId: null,
                type: 'videoFile',
                status: "error",
                log: (error.message || 'در هنگام آپلود فایل خطایی رخ داده است')
            })
            throw new Error("rush upload file error");
        }

        if (gif) {
            console.log("Send gif");
            try {
                const gifID = (await RashGateway.sendFile2Product(gif));
                console.log("gif uploaded: " + gifID);
                await this.createLog({
                    exportId,
                    objectId: gifID,
                    type: 'gif',
                    status: "ok",
                    log: 'آپلود گیف موفقیت آمیز بود'
                });

                dataToSend.gifID = gifID;
            } catch (error) {
                await this.ExportVideoService.updateProductStatusByCode(null, exportCode, 'error');

                await this.createLog({
                    exportId,
                    objectId: null,
                    type: 'gif',
                    status: "error",
                    log: (error.message || 'در هنگام آپلود گیف خطایی رخ داده است')
                })
                throw new Error("rush upload gif error");
            }
        }

        dataToSend.sku = exportCode;

        console.log(11111111, { exportCode, productId })

        await RashGateway.updateProductFiles(productId, dataToSend)
            .then(async (response) => {
                const { productID, message } = response;
                if (!productID) {
                    await this.createLog({ exportId, objectId: null, type: 'data', status: "error", log: message })
                    await this.ExportVideoService.updateProductStatusByCode(productID, exportCode, 'error');
                    throw new Error(message);
                }
                else {
                    await this.createLog({ exportId, objectId: productID, type: 'data', status: "ok", log: 'اتمام' })
                    await this.ExportVideoService.updateProductStatusByCode(productID, exportCode, 'complete');
                }
            }).catch(async error => {
                await this.createLog({ exportId, objectId: null, type: 'data', status: "error", log: error.message })
                await this.ExportVideoService.updateProductStatusByCode(null, exportCode, 'error');
                throw error;
            })
    }
}

module.exports = RashService;