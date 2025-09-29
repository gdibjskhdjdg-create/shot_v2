const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const writeXlsxFile = require('write-excel-file/node');
const { generateRandomCode, secondToTimeFormat, sizeToFormat } = require('../../../helper/general.tool');
const Service = require('../../_default/service');
const VideoDetailEntity = require('../../entity/videoDetail/VideoDetail.entity');
const redis = require('../../../db/redis');

class VideoDetailExport_Service extends Service {

    constructor(
        videoDetailService = () => { },
        videoDetailScoreService = () => { }
    ) {
        super()
        this.videoDetailService = videoDetailService;
        this.videoDetailScoreService = videoDetailScoreService;
        // this.folderToStore = "shotDetailExport"
        this.folderToStore = "excel"
        this.fullPathToStore = path.join(__dirname, '..', '..', '..', appConfigs.STORE_FOLDER_FROM_APP_ROOT, this.folderToStore);

        if (!fs.existsSync(this.fullPathToStore)) {
            fs.mkdirSync(this.fullPathToStore, { recursive: true });
        }
    }

    async getSpecialVideoDetailList(filters = {}) {
        const { videoDetails, count } = await this.videoDetailService.specialVideoDetailList(filters);
        return { videoDetails, count }
    }

    async getExportVideoDetailsId(videoFileId, isExcludeMode, filters = {}) {
        let allVideoDetailsId = videoFileId
        if (isExcludeMode) {
            const response = (await this.getSpecialVideoDetailList({ excludesId: videoFileId, ...filters, page: 1, take: null }))
            allVideoDetailsId = response.videoDetails.map(x => x.videoFileId)
        }

        return allVideoDetailsId;
    }

    async exportSpecialVideoDetail(exportType, filters = {}) {
        const { videoDetails, count } = await this.getSpecialVideoDetailList(filters);
        return await this.exportVideoDetail(exportType, videoDetails.map(x => x.videoFileId))
    }

    async exportVideoDetail(exportType, videoFileId) {
        const json = JSON.stringify({
            exportType,
            videoFileId,
        })

        const exportKey = crypto.createHash('sha256').update(json).digest('hex');
        let checkRedis = await redis.get(exportKey);
        if (checkRedis) {
            checkRedis = JSON.parse(checkRedis);
            if (checkRedis.inProcess) {
                throw ErrorResult.badRequest("فرایند در  حال اجرا می باشد")
            }
            else {
                return checkRedis;
            }
        }
        else {
            await redis.set(exportKey, JSON.stringify({ inProcess: true }));
            await redis.expire(exportKey, 2 * 60);
        }

        let videoDetails = await this.videoDetailService.detail(videoFileId);
        videoDetails = await this.prepareVideoDetailToExport(videoDetails);

        let fileName = "";

        switch (exportType) {
            case "excel":
                fileName = await this.excelExport(videoDetails);
                break;
            default:
                break;
        }


        const output = {
            fileName,
            link: this.generateDownloadLink(`${this.folderToStore}/${fileName}`),
            path: path.join(this.fullPathToStore, fileName)
        }

        await redis.set(exportKey, JSON.stringify(output));
        await redis.expire(exportKey, 1 * 60);
        return output
    }

    async prepareVideoDetailToExport(videoDetails) {
        const defaultValues = await this.videoDetailService.getBasicInfoForVideoDetail();

        const videoDetailsScore = (await this.videoDetailScoreService.getBySection({ videoFileId: videoDetails.map(x => x.videoFileId) })).map(x => x.toJSON())

        const setLangText = (vid, type, key) => {
            let langText = "ندارد";
            if (vid[key]) {
                let langIds = vid.languageIds.filter(item => item.type === type).map(item => item.languageId);
                langText = defaultValues.languages.filter(item => langIds.includes(item.id)).map(item => item.name).join(" - ");
            }
            else if (vid[key] === null) {
                langText = "اهمیت ندارد";
            }

            return langText;
        }

        for (const videoDetail of videoDetails) {
            const tagText = (inputId) => {
                return videoDetail.allTags.filter(item => item.VideoDetailRelTag.inputId === inputId).map(item => item.tag).join(" ,")
            }

            const scoreKeys = VideoDetailEntity.getAllKeys()
            videoDetail.score = []
            for (const key of scoreKeys) {
                const findScore = videoDetailsScore.find(x => x.videoFileId == videoDetail.videoFileId && x.scoreKey == key)
                videoDetail.score.push(findScore ? findScore.score : "")
            }

            videoDetail.soundQuality = defaultValues.defaultValue.soundQuality.find(item => item.value == videoDetail.soundQuality)?.key ?? "";
            videoDetail.colorText = defaultValues.defaultValue.color.find(item => item.value == videoDetail.color)?.key ?? "";
            videoDetail.pictureEnvironmentText = defaultValues.defaultValue.pictureEnvironment.find(item => item.value == videoDetail.pictureEnvironment)?.key ?? "";
            videoDetail.owner = defaultValues.owners.find(item => item.value == videoDetail.owner)?.key ?? "";
            videoDetail.ageRangeDefaultValue = defaultValues.defaultValue.ageRange.find(item => item.value == videoDetail.ageRangeDefaultValueId)?.key ?? "";
            videoDetail.mainLanguageText = setLangText(videoDetail, "mainLanguage", "hasMainLang");
            videoDetail.dubLanguageText = setLangText(videoDetail, "dubbed", "hasDubbed");
            videoDetail.subLanguageText = setLangText(videoDetail, "subtitle", "hasSubtitle");
            videoDetail.narLanguageText = setLangText(videoDetail, "narration", "hasNarration");
            videoDetail.category = videoDetail.category.map(item => item.name).join(" - ");
            videoDetail.tagText = defaultValues.inputs.map(input => tagText(input.id));
            videoDetail.pictureMode = defaultValues.defaultValue.pictureMode.find(item => item.id == videoDetail.pictureModeId)?.key ?? "";
            videoDetail.pictureType = defaultValues.defaultValue.pictureType.find(item => item.id == videoDetail.pictureTypeId)?.key ?? "";
            videoDetail.pictureView = defaultValues.defaultValue.pictureView.find(item => item.id == videoDetail.pictureViewId)?.key ?? "";
            videoDetail.dayNight = defaultValues.defaultValue.dayNight.find(item => item.value == videoDetail.dayNight)?.key ?? "";
            switch (videoDetail.qualityGrade) {
                case 0:
                    videoDetail.qualityGrade = "ضعیف"
                    break;
                case 1:
                    videoDetail.qualityGrade = "متوسط"
                    break;
                case 2:
                    videoDetail.qualityGrade = "خوب"
                    break;
                case 3:
                    videoDetail.qualityGrade = "عالی"
                    break;
            }
        }

        return videoDetails
    }

    async excelExport(videoDetails = []) {
        const header = [
            { value: 'ردیف' },
            { value: 'نام پروژه' },
            { value: 'مسیر' },
            { value: 'نام فایل' },
            { value: 'مدت زمان ویدئو' },
            { value: 'حجم ویدئو' },
            { value: 'فریم ریت' },
            { value: 'frame width' },
            { value: 'frame height' },
            { value: 'رزولوشن' },
            { value: 'فرمت' },
            { value: 'کیفیت صدا' },
            { value: 'لرزش دوربین' },
            { value: 'لوگو' },
            { value: 'زبان دوبله' },
            { value: 'زبان اصلی' },
            { value: 'زبان زیرنویس' },
            { value: 'نریشن' },
            { value: 'موسیقی' },
            { value: 'رنگ' },
            { value: 'محیط تصویر' },
            { value: 'شروع زمان شات لیست' },
            { value: 'پایان زمان شات لیست' },
            { value: 'موضوع' },
            { value: 'شرح نریشن' },
            { value: 'شرح تصویر' },
            { value: 'جنسیت' },
            { value: 'ردیف سنی' },
            { value: 'از تاریخ' },
            { value: 'تا تاریخ' },
            { value: 'نوع تصویر' },
            { value: 'حرکت دوربین' },
            { value: 'نما' },
            { value: 'روز/شب' },
            { value: 'مالکیت' },
            { value: 'آرشیوی' },
            { value: 'ادغام' },
            { value: 'درجه کیفی' },
            { value: 'توضیحات' },

            { value: 'مناسبت' },
            { value: 'اشخاصی که در تصویر می بینید' },
            { value: 'اشخاصی که با آن ها مصاحبه شده است' },
            { value: 'کلیدواژه مصاحبه' },
            { value: 'اشخاصی که در مورد آن ها صحبت شده است' },
            { value: 'مکان فیلم' },
            { value: 'مکانهایی که در مورد آن صحبت شده است' },
            { value: 'کلیدواژه های نریشن' },
            { value: 'کلیدواژه های مهم' },
            { value: 'نریتور' },
            ...VideoDetailEntity.getAllTitles().map(value => ({ value })),
        ];


        const createdDataItem = (videoDetail, index) => {
            return [
                { type: String, value: `${index + 1}` },
                { type: String, value: videoDetail.project?.title || "" },
                { type: String, value: videoDetail.videoFile.originalPath },
                { type: String, value: videoDetail.videoFile.originalName },
                { type: String, value: secondToTimeFormat(videoDetail.videoFile.duration) },
                { type: String, value: sizeToFormat(videoDetail.videoFile.size) },
                { type: String, value: videoDetail.videoFile.frameRate },
                { type: String, value: videoDetail.videoFile.width },
                { type: String, value: videoDetail.videoFile.height },
                { type: String, value: videoDetail.videoFile.aspectRatio },
                { type: String, value: videoDetail.videoFile.format },
                { type: String, value: videoDetail.soundQuality },
                { type: String, value: videoDetail.hasCameraShake ? "دارد" : "ندارد" },
                { type: String, value: videoDetail.hasLogo ? "دارد" : "ندارد" },
                { type: String, value: videoDetail.dubLanguageText },
                { type: String, value: videoDetail.mainLanguageText },
                { type: String, value: videoDetail.subLanguageText },
                { type: String, value: videoDetail.narLanguageText },
                { type: String, value: videoDetail.hasMusic ? "دارد" : "ندارد" },
                { type: String, value: videoDetail.colorText },
                { type: String, value: videoDetail.pictureEnvironmentText },
                { type: String, value: secondToTimeFormat(videoDetail.startTime) },
                { type: String, value: secondToTimeFormat(videoDetail.endTime) },
                { type: String, value: videoDetail.category },
                { type: String, value: videoDetail.narrationDescription },
                { type: String, value: videoDetail.pictureDescription },
                { type: String, value: videoDetail.gender === null ? "" : (videoDetail.gender ? "آقا" : "خانم") },
                { type: String, value: videoDetail.ageRangeDefaultValue },
                { type: String, value: videoDetail.startDate },
                { type: String, value: videoDetail.endDate },
                { type: String, value: videoDetail.pictureType },
                { type: String, value: videoDetail.pictureMode },
                { type: String, value: videoDetail.pictureView },
                { type: String, value: videoDetail.dayNight },
                { type: String, value: videoDetail.owner },
                { type: String, value: videoDetail.isArchive ? "هست" : "نیست" },
                { type: String, value: "" },
                { type: String, value: videoDetail.qualityGrade },
                { type: String, value: videoDetail.description },
                ...videoDetail.tagText.map(value => ({ type: String, value })),
                ...videoDetail.score.map(value => ({ type: String, value })),
            ];
        }

        const rows = [header]
        for (let i = 0; i < videoDetails.length; i++) {
            const videoDetail = videoDetails[i]
            rows.push(createdDataItem(videoDetail, i))
        }

        const exportName = "video_" + Date.now() + generateRandomCode(5) + ".xlsx";
        const exportPath = path.join(this.fullPathToStore, exportName);
        await writeXlsxFile(rows, {
            filePath: exportPath
        });

        return exportName
    }

    async excelExportPath(videoDetails = []) {
        const header = [
            { value: 'ردیف' },
            { value: 'شناسه' },
            { value: 'نام فایل' },
            { value: 'مسیر' },
            { value: 'زمان' },
            { value: 'زمان (ثانیه)' },
            { value: 'سایز' },
            { value: 'سایز کامل' },
        ];

        const createdDataItem = (videoDetail, index) => {
            return [
                { type: String, value: `${index + 1}` },
                { type: String, value: videoDetail.id.toString() },
                { type: String, value: videoDetail.originalName },
                { type: String, value: videoDetail.originalPath },
                { type: String, value: secondToTimeFormat(videoDetail.duration) },
                { type: Number, value: parseFloat(videoDetail.duration) },
                { type: String, value: sizeToFormat(videoDetail.size) },
                { type: Number, value: parseFloat(videoDetail.size) },
            ];
        }

        const rows = [header]
        for (let i = 0; i < videoDetails.length; i++) {
            const videoDetail = videoDetails[i]
            rows.push(createdDataItem(videoDetail, i))
        }

        const exportName = "video_" + Date.now() + generateRandomCode(5) + ".xlsx";
        const exportPath = path.join(this.fullPathToStore, exportName);
        await writeXlsxFile(rows, {
            filePath: exportPath
        });

        return exportName
    }

    async exportSpecialVideoDetailPath(exportType, filters = {}) {
        if(filters.isExcludeMode){
            filters.excludesId = filters.videoDetailsId;
        } else {
            filters = { id: filters.videoDetailsId }
        }
        const { videoDetails, count } = await this.videoDetailService.specialVideoDetailList(filters);
        const videoFiles = videoDetails.map(item => item.videoFile).map(item => item.toJSON());

        let fileName = null;
        switch (exportType) {
            case "excel":
                fileName = await this.excelExportPath(videoFiles);
                break;
            default:
                break;
        }

        const output = {
            fileName,
            link: this.generateDownloadLink(`${this.folderToStore}/${fileName}`),
            path: path.join(this.fullPathToStore, fileName)
        }

        return output;
    }
}

module.exports = VideoDetailExport_Service;
