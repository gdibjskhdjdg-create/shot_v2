const fs = require('fs');
const path = require('path');
const xmlFormat = require('xml-formatter');
const writeXlsxFile = require('write-excel-file/node');
const { generateRandomCode, secondToTimeFormat } = require('../../../helper/general.tool');
const ShotScoreEntity = require('../../entity/shotList/ShotScore.entity');
const ShotExportType_ENUM = require('../../models/shotList/constants/shotExportType.enum');
const { zip } = require('zip-a-folder');
const { shotService, shotScoreService } = require('./index');

const dirPathToStore = path.join(__dirname, '..', '..', '..', appConfigs.STORE_FOLDER_FROM_APP_ROOT);

Object.values(ShotExportType_ENUM).forEach(value => {
    const folder = path.join(dirPathToStore, value.name);
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
});

const listSpecialShots = (filters = {}) => {
    return shotService.listSpecialShots(filters);
};

const getExportShotIds = async (shotsId, isExcludeMode, filters = {}) => {
    if (!isExcludeMode) {
        return (shotsId || []).sort((a, b) => a - b);
    }
    const { shots } = await listSpecialShots({ ...filters, excludesId: shotsId, page: 1, take: null });
    return shots.map(x => x.id).sort((a, b) => a - b);
};

const exportSpecialShots = async (exportType, filters = {}) => {
    const { shots } = await listSpecialShots(filters);
    return exportShots(exportType, shots.map(x => x.id));
};

const exportShotsByVideo = (exportType, videoFileId) => {
    return exportSpecialShots(exportType, { videoFileId });
};

const exportShotsByProject = async (exportType, projectId) => {
    const { shots } = await listSpecialShots({ projectId, page: 1, take: null });
    const videosFileIds = [...new Set(shots.map(x => x.videoFile.id))];

    const folderProject = path.join(dirPathToStore, exportType, 'projects', projectId);
    if (fs.existsSync(folderProject)) {
        fs.rmSync(folderProject, { recursive: true, force: true });
    }
    fs.mkdirSync(folderProject, { recursive: true });

    for (const videoFileId of videosFileIds) {
        const response = await exportShotsByVideo(exportType, videoFileId);
        if (response && response.path && response.fileName) {
            fs.renameSync(response.path, path.join(folderProject, response.fileName));
        }
    }

    const fileName = `${Date.now()}${generateRandomCode(5)}.zip`;
    const targetZip = path.join(folderProject, '..', fileName);
    await zip(folderProject, targetZip);

    fs.rmSync(folderProject, { recursive: true, force: true });

    return {
        fileName,
        link: generateDownloadLink(`${exportType}/projects/${fileName}`),
        path: targetZip
    };
};

const exportShots = async (exportType, shotsId) => {
    if (!shotsId || shotsId.length === 0) {
        throw new Error("No shots to export");
    }

    let shots = await shotService.getShotsDetails(shotsId);
    shots = await prepareShotsForExport(shots);

    let fileName = "";
    switch (exportType) {
        case ShotExportType_ENUM.EXCEL.name:
            fileName = await createExcelExport(shots);
            break;
        case ShotExportType_ENUM.XML.name:
            fileName = await createXmlExport(shots);
            break;
        default:
            throw new Error("Invalid export type");
    }

    return {
        fileName,
        link: generateDownloadLink(`${exportType}/${fileName}`),
        path: path.join(dirPathToStore, exportType, fileName)
    };
};

const prepareShotsForExport = async (shots) => {
    const defaultValues = await shotService.getShotFormBasicInfo();
    const shotIds = shots.map(x => x.id);
    const shotsScore = (await shotScoreService.getBySection({ shotId: shotIds })).map(x => x.toJSON());

    const findLangText = (shot, type, key) => {
        if (shot[key] === null) return "اهمیت ندارد";
        if (!shot[key]) return "ندارد";
        const langIds = shot.languageIds.filter(item => item.type === type).map(item => item.languageId);
        return defaultValues.languages.filter(item => langIds.includes(item.id)).map(item => item.name).join(" - ") || "ندارد";
    };

    for (const shot of shots) {
        shot.score = ShotScoreEntity.getAllKeys().map(key => {
            const findScore = shotsScore.find(x => x.shotId == shot.id && x.scoreKey == key);
            return findScore ? findScore.score : "";
        });

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
        shot.tagText = defaultValues.inputs.map(input => shot.allTags.filter(item => item.ShotRelTag.inputId === input.id).map(item => item.tag).join(" ,"));
        shot.pictureMode = defaultValues.defaultValue.pictureMode.find(item => item.id == shot.pictureModeId)?.key ?? "";
        shot.pictureType = defaultValues.defaultValue.pictureType.find(item => item.id == shot.pictureTypeId)?.key ?? "";
        shot.pictureView = defaultValues.defaultValue.pictureView.find(item => item.id == shot.pictureViewId)?.key ?? "";
        shot.dayNight = defaultValues.defaultValue.dayNight.find(item => item.value == shot.dayNight)?.key ?? "";
        
        switch (shot.qualityGrade) {
            case 0: shot.qualityGrade = "ضعیف"; break;
            case 1: shot.qualityGrade = "متوسط"; break;
            case 2: shot.qualityGrade = "خوب"; break;
            case 3: shot.qualityGrade = "عالی"; break;
        }
    }
    return shots;
};

const createExcelExport = async (shots = []) => {
    const header = [/* ... */];
    const rows = [header];
    shots.forEach((shot, index) => {
        const row = [/* ... */]; 
        rows.push(row);
    });

    const exportName = "shot_" + Date.now() + generateRandomCode(5) + ".xlsx";
    const exportPath = path.join(dirPathToStore, ShotExportType_ENUM.EXCEL.name, exportName);
    await writeXlsxFile(rows, { filePath: exportPath });
    return exportName;
};

const createXmlExport = async (shots) => {
    if (shots.length === 0) return "";
    const videoFile = shots[0].videoFile;
    const exportName = videoFile.originalName + ".xml";
    const exportPath = path.join(dirPathToStore, ShotExportType_ENUM.XML.name, exportName);
    return exportName;
};

const generateDownloadLink = (filePath) => {
    return `/download/${filePath}`;
};

module.exports = {
    listSpecialShots,
    getExportShotIds,
    exportSpecialShots,
    exportShotsByVideo,
    exportShotsByProject,
    exportShots,
    prepareShotsForExport,
    createExcelExport,
    createXmlExport,
    generateDownloadLink,
};