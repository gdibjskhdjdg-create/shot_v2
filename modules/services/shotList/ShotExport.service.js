const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const xmlFormat = require('xml-formatter');
const writeXlsxFile = require('write-excel-file/node');
const { generateRandomCode, secondToTimeFormat } = require('../../../helper/general.tool');
const Service = require('../../_default/service');
const ShotScoreEntity = require('../../entity/shotList/ShotScore.entity');
const redis = require('../../../db/redis');
const ShotExportType_ENUM = require('../../models/shotList/constants/shotExportType.enum');
const { zip } = require('zip-a-folder');

class ShotExport_Service extends Service {

    constructor(
        shotService = () => { },
        shotScoreService = () => { }
    ) {
        super()
        this.shotService = shotService;
        this.shotScoreService = shotScoreService;
        // this.folderToStore = "shotDetailExport"
        // this.folderToStore = "excel"
        this.dirPathToStore = path.join(__dirname, '..', '..', '..', appConfigs.STORE_FOLDER_FROM_APP_ROOT);

        Object.entries(ShotExportType_ENUM).map(([key, value]) => {
            const folder = path.join(this.dirPathToStore, value.name)
            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder, { recursive: true });
            }
        })

    }

    async getSpecialShotList(filters = {}) {
        const { shots, count } = await this.shotService.specialShotList(filters);
        return { shots, count }
    }

    async getExportShotsId(shotsId, isExcludeMode, filters = {}) {

        let allShotsId = shotsId
        if (isExcludeMode) {
            const response = (await this.getSpecialShotList({ excludesId: shotsId, ...filters, page: 1, take: null }))
            allShotsId = response.shots.map(x => x.id)
        }

        return allShotsId.sort((a, b) => (a - b))
    }

    async exportSpecialShot(exportType, filters = {}) {
        const { shots, count } = await this.getSpecialShotList(filters);
        return await this.exportShot(exportType, shots.map(x => x.id))
    }

    async exportShotsOfVideo(exportType, videoFileId) {
        return await this.exportSpecialShot(exportType, { videoFileId })
    }

    async exportShotsOfProject(exportType, projectId) {
        const { shots } = await this.getSpecialShotList({ projectId })
        let videosFileIds = shots.map(x => x.videoFile.id)
        videosFileIds = [...new Set(videosFileIds)]

        /**
         * make projects and project id folders
         */
        const folderProject = path.join(this.dirPathToStore, exportType, 'projects', projectId);
        if (fs.existsSync(folderProject)) {
            fs.rmdirSync(folderProject, { recursive: true })
        }

        fs.mkdirSync(folderProject, { recursive: true })
        /* generate and store exports files and get array of path */
        for (const videoFileId of videosFileIds) {
            const response = await this.exportShotsOfVideo(exportType, videoFileId)

            const { path: filePath, fileName } = response

            const newPath = path.join(folderProject, fileName)
            fs.renameSync(filePath, newPath)
        }

        /* make zip */
        const fileName = Date.now() + generateRandomCode(5) + ".zip";
        const targetZip = path.join(folderProject, '..', fileName)
        const zipWS = fs.createWriteStream(targetZip);

        await zip(folderProject, undefined, { customWriteStream: zipWS });

        zipWS.close(() => {
            /**
             * delete all xml files
            */
            if (fs.existsSync(folderProject)) {
                fs.rmdirSync(folderProject, { recursive: true })
            }
        })

        return {
            fileName,
            link: this.generateDownloadLink(`${exportType}/projects/${fileName}`),
            path: targetZip
        }

    }

    async exportShot(exportType, shotsId) {
        const json = JSON.stringify({
            exportType,
            shotsId,
        })
        const exportKey = crypto.createHash('sha256').update(json).digest('hex');
        let checkRedis = await redis.get(exportKey);

        // if (checkRedis) {
        //     checkRedis = JSON.parse(checkRedis);
        //     if (checkRedis.inProcess) {
        //         throw ErrorResult.badRequest("فرایند در  حال اجرا می باشد")
        //     }
        //     else {
        //         return checkRedis;
        //     }
        // }
        // else {
        //     await redis.set(exportKey, JSON.stringify({ inProcess: true }));
        //     await redis.expire(exportKey, 2 * 60);
        // }

        let shots = await this.shotService.shotsDetail(shotsId);
        shots = await this.prepareShotToExport(shots);

        let fileName = "";
        switch (exportType) {
            case ShotExportType_ENUM.EXCEL.name:
                fileName = await this.excelExport(shots);
                break;
            case ShotExportType_ENUM.XML.name:
                fileName = await this.xmlExport(shots);
                break;
            default:
                break;
        }

        const output = {
            fileName,
            link: this.generateDownloadLink(`${exportType}/${fileName}`),
            path: path.join(this.dirPathToStore, exportType, fileName)
        }

        // await redis.set(exportKey, JSON.stringify(output));
        // await redis.expire(exportKey, 1 * 60);

        return output
    }

    async prepareShotToExport(shots) {
        const defaultValues = await this.shotService.getBasicInfoForShot();
        const shotsScore = (await this.shotScoreService.getBySection({ shotId: shots.map(x => x.id) })).map(x => x.toJSON());
        const findLangText = (shot, type, key) => {
            let langText = "ندارد";
            if (shot[key]) {
                let langIds = shot.languageIds.filter(item => item.type === type).map(item => item.languageId);
                langText = defaultValues.languages.filter(item => langIds.includes(item.id)).map(item => item.name).join(" - ");
            }
            else if (shot[key] === null) {
                langText = "اهمیت ندارد";
            }

            return langText;
        }

        for (const shot of shots) {
            const tagText = (inputId) => {
                return shot.allTags.filter(item => item.ShotRelTag.inputId === inputId).map(item => item.tag).join(" ,")
            }

            const scoreKeys = ShotScoreEntity.getAllKeys()
            shot.score = []
            for (const key of scoreKeys) {
                const findScore = shotsScore.find(x => x.shotId == shot.id && x.scoreKey == key)
                shot.score.push(findScore ? findScore.score : "")
            }

            shot.soundQuality = defaultValues.defaultValue.soundQuality.find(item => item.value == shot.soundQuality)?.key ?? "";
            shot.colorText = defaultValues.defaultValue.color.find(item => item.value == shot.color)?.key ?? "";
            shot.pictureEnvironmentText = defaultValues.defaultValue.pictureEnvironment.find(item => item.value == shot.pictureEnvironment)?.key ?? "";
            shot.owner = defaultValues.owners.find(item => item.value == shot.owner)?.key ?? "";
            shot.ageRangeDefaultValue = defaultValues.defaultValue.ageRange.find(item => item.value == shot.ageRangeDefaultValueId)?.key ?? "";
            shot.mainLanguageText = findLangText(shot, "mainLanguage", "hasMainLang");
            shot.dubLanguageText = findLangText(shot, "dubbed", "hasDubbed");
            shot.subLanguageText = findLangText(shot, "subtitle", "hasSubtitle");
            shot.narLanguageText = findLangText(shot, "narration", "hasNarration");
            shot.category = shot.category.map(item => item.name).join(" - ");
            shot.tagText = defaultValues.inputs.map(input => tagText(input.id));
            shot.pictureMode = defaultValues.defaultValue.pictureMode.find(item => item.id == shot.pictureModeId)?.key ?? "";
            shot.pictureType = defaultValues.defaultValue.pictureType.find(item => item.id == shot.pictureTypeId)?.key ?? "";
            shot.pictureView = defaultValues.defaultValue.pictureView.find(item => item.id == shot.pictureViewId)?.key ?? "";
            shot.dayNight = defaultValues.defaultValue.dayNight.find(item => item.value == shot.dayNight)?.key ?? "";
            switch (shot.qualityGrade) {
                case 0:
                    shot.qualityGrade = "ضعیف"
                    break;
                case 1:
                    shot.qualityGrade = "متوسط"
                    break;
                case 2:
                    shot.qualityGrade = "خوب"
                    break;
                case 3:
                    shot.qualityGrade = "عالی"
                    break;
            }

        }

        return shots
    }

    async excelExport(shots = []) {
        const header = [
            { value: 'ردیف' },
            { value: 'عنوان' },
            { value: 'نام پروژه' },
            { value: 'مسیر' },
            { value: 'نام فایل' },
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
            ...ShotScoreEntity.getAllTitles().map(value => ({ value })),
        ];

        const createdDataItem = (shot, index) => {
            return [
                { type: String, value: `${index + 1}` },
                { type: String, value: shot?.title || "" },
                { type: String, value: shot?.project?.title || "" },
                { type: String, value: shot?.videoFile?.originalPath },
                { type: String, value: shot?.videoFile?.originalName },
                { type: String, value: shot?.videoFile?.frameRate },
                { type: String, value: shot?.videoFile?.width },
                { type: String, value: shot?.videoFile?.height },
                { type: String, value: shot?.videoFile?.aspectRatio },
                { type: String, value: shot?.videoFile?.format },
                { type: String, value: shot?.soundQuality },
                { type: String, value: shot?.hasCameraShake ? "دارد" : "ندارد" },
                { type: String, value: shot?.hasLogo ? "دارد" : "ندارد" },
                { type: String, value: shot?.dubLanguageText },
                { type: String, value: shot?.mainLanguageText },
                { type: String, value: shot?.subLanguageText },
                { type: String, value: shot?.narLanguageText },
                { type: String, value: shot?.hasMusic ? "دارد" : "ندارد" },
                { type: String, value: shot?.colorText },
                { type: String, value: shot?.pictureEnvironmentText },
                { type: String, value: secondToTimeFormat(shot?.startTime) },
                { type: String, value: secondToTimeFormat(shot?.endTime) },
                { type: String, value: shot?.category },
                { type: String, value: shot?.narrationDescription },
                { type: String, value: shot?.pictureDescription },
                { type: String, value: shot?.gender === null ? "" : (shot?.gender ? "آقا" : "خانم") },
                { type: String, value: shot?.ageRangeDefaultValue },
                { type: String, value: shot?.startDate },
                { type: String, value: shot?.endDate },
                { type: String, value: shot?.pictureType },
                { type: String, value: shot?.pictureMode },
                { type: String, value: shot?.pictureView },
                { type: String, value: shot?.dayNight },
                { type: String, value: shot?.owner },
                { type: String, value: shot?.isArchive == 1 ? "هست" : "نیست" },
                { type: String, value: "" },
                { type: String, value: shot?.qualityGrade },
                { type: String, value: shot?.description },
                ...shot?.tagText.map(value => ({ type: String, value })),
                ...shot?.score.map(value => ({ type: String, value })),
            ];
        }

        const rows = [header]
        for (let i = 0; i < shots.length; i++) {
            const shot = shots[i]
            rows.push(createdDataItem(shot, i))
        }

        const exportName = "shot_" + Date.now() + generateRandomCode(5) + ".xlsx";
        const exportPath = path.join(this.dirPathToStore, ShotExportType_ENUM.EXCEL.name, exportName);
        await writeXlsxFile(rows, {
            filePath: exportPath
        });

        return exportName
    }

    async xmlExport(shots) {
        // I suppose to all of shots have a same video, if shots have multi videos, you have to loop
        const videoFile = shots[0].videoFile;

        const videoPath = path.join(videoFile.originalPath, videoFile.originalName);
        const frameRate = +videoFile.frameRate;
        const duration = (+videoFile.duration || 0) * frameRate;

        const audioChannel = ["", ""];
        let xmlBodyVideo = "";
        let firstTimeImportFile = false;

        shots.forEach((shot, index) => {
            let fileRow = `<file id="main-file"/>`;
            if (!firstTimeImportFile) {
                firstTimeImportFile = true;
                fileRow = `
                <file id="main-file">
                    <name>${videoFile.originalName}</name>
                    <pathurl>${videoPath}</pathurl>
                    <rate>
                        <timebase>${frameRate}</timebase>
                        <ntsc>FALSE</ntsc>
                    </rate>
                    <duration>${duration}</duration>
                    <timecode>
                        <rate>
                            <timebase>${frameRate}</timebase>
                            <ntsc>FALSE</ntsc>
                        </rate>
                        <string>00:00:00:00</string>
                        <frame>0</frame>
                        <displayformat>NDF</displayformat>
                    </timecode>
                    <media>
                        <video>
                            <samplecharacteristics>
                                <rate>
                                    <timebase>${frameRate}</timebase>
                                    <ntsc>FALSE</ntsc>
                                </rate>
                                <width>${videoFile.width}</width>
                                <height>${videoFile.height}</height>
                            </samplecharacteristics>
                        </video> 
                    </media>
                </file>`;
            }

            xmlBodyVideo += `
<sequence>
    <duration>${duration}</duration>
    <rate>
        <timebase>${frameRate}</timebase>
        <ntsc>FALSE</ntsc>
    </rate>
    <name>${videoFile.originalName}</name>
    <media>
        <video>
            <format>
                <samplecharacteristics>
                    <rate>
                        <timebase>${frameRate}</timebase>
                        <ntsc>FALSE</ntsc>
                    </rate>
                    <width>${videoFile.width}</width>
                    <height>${videoFile.height}</height>
                </samplecharacteristics>
            </format>
            <track>
                <clipitem id="clipitem-10${index}">
                    <masterclipid>masterclip-10${index}</masterclipid>
                    <name>${videoFile.originalName}</name>
                    <enabled>TRUE</enabled>
                    <duration>${duration}</duration>
                    <rate>
                       <timebase>${frameRate}</timebase>
                        <ntsc>FALSE</ntsc>
                    </rate>
                    <start>${+shot.startTime * frameRate}</start>
                    <end>${+shot.endTime * frameRate}</end>
                    <in>${+shot.startTime * frameRate}</in>
                    <out>${+shot.endTime * frameRate}</out>
                    <anamorphic>FALSE</anamorphic>
                    ${fileRow}
                </clipitem>    
            </track>
        </video>
    </media>
</sequence>
            `

            // fileRow = `<file id="main-file"/>`;
            // const getAudioOutput = (audioChannelNum) => {
            //     return `
            //         <clipitem id="clipitem-3${audioChannelNum}0${index}">
            //             <masterclipid>masterclip-3${audioChannelNum}0${index}</masterclipid>
            //             <name>${videoFile.originalName}</name>
            //             <enabled>TRUE</enabled>
            //             <duration>${duration}</duration>
            //             <rate>
            //                 <timebase>${frameRate}</timebase>
            //                 <ntsc>FALSE</ntsc>
            //             </rate>
            //             <start>${+shot.startTime * frameRate}</start>
            //             <end>${+shot.endTime * frameRate}</end>
            //             <in>${+shot.startTime * frameRate}</in>
            //             <out>${+shot.endTime * frameRate}</out>
            //             <anamorphic>FALSE</anamorphic>
            //             ${fileRow}
            //                 <sourcetrack>
            //                     <mediatype>audio</mediatype>
            //                     <trackindex>${audioChannelNum}</trackindex>
            //                 </sourcetrack>
            //             </clipitem>
            //         `
            // }

            // for (let j = 0; j < audioChannel.length; j++) {
            //     audioChannel[j] += getAudioOutput(j + 1)
            // }
        })

        let mainXML = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="4">
    ${xmlBodyVideo} 
</xmeml>`

        {/* <audio>
<numOutputChannels>${audioChannel.length}</numOutputChannels>
<outputs>
    ${audioChannel.map((i, index) => (`
        <group>
            <index>${index + 1}</index>
            <numchannels>1</numchannels>
            <downmix>0</downmix>
            <channel>
                <index>${index + 1}</index>
            </channel>
        </group>
    `)).join(" ")}
</outputs>

${audioChannel.map((audios, index) => (`
    <track 
        currentExplodedTrackIndex="${index}" 
        totalExplodedTrackCount="2" 
    >
        ${audios}
        <outputchannelindex>${index+1}</outputchannelindex>
    </track>
`)).join(" ")}
</audio> */}

        const exportName = videoFile.originalName + ".xml";
        const exportPath = path.join(this.dirPathToStore, ShotExportType_ENUM.XML.name, exportName);

        fs.writeFileSync(exportPath, mainXML);

        return exportName
    }

}

module.exports = ShotExport_Service;
