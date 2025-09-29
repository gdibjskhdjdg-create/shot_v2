const fs = require('fs');
const path = require('path');
const readXlsxFile = require('read-excel-file/node');

const Service = require("../../_default/service");
const ErrorResult = require('../../../helper/error.tool');
const ShotDefaultValueService = require('./ShotDefaultValue.service');
const { projectService } = require('../project');
const CategoryService = require('../category/Category.service');
const OwnerService = require('../owner/Owner.service');
const LanguageService = require('../../services/language/Language.service');
const TagService = require('../../services/tag/Tag.service');

const {
    VideoFile,
    Shot
} = require('../../_default/model');
const { shotService } = require('./index');
const ShotInputService = require('./ShotInput.service');
const CityService = require('../../services/tag/City.service');
const { logError } = require('../../../helper/log.tool');
const emitter = require('../../_default/eventEmitter');
const { pipeline } = require('stream');
const util = require('util');
const TypeTool = require('../../../helper/type.tool');
const pump = util.promisify(pipeline);


const validColName = [
    { key: "نام پروژه", newKey: "project" },
    { key: "نام فولدر", newKey: "folder" }, // multi
    { key: "نام فایل", newKey: "file" },
    { key: "فریم ریت", newKey: "frameRate" },
    { key: "fram width", newKey: "frameWidth" },
    { key: "frame height", newKey: "frameHeight" },
    { key: "رزولوشن", newKey: "aspectRatio" },
    { key: "فرمت", newKey: "format" },
    { key: "کیفیت صدا", newKey: "soundQuality" },
    { key: "لرزش دوربین", newKey: "hasCameraShake" },
    { key: "لوگو", newKey: "hasLogo" },
    { key: "زبان دوبله", newKey: "dubbed" },
    { key: "زبان اصلی", newKey: "mainLanguage" },
    { key: "زبان زیرنویس", newKey: "subtitle" },
    { key: "نریشن", newKey: "narration" },
    { key: "موسیقی", newKey: "hasMusic" },
    { key: "رنگ", newKey: "color" },
    { key: "محیط تصویر", newKey: "pictureEnvironment" },
    { key: "شروع زمان شات لیست", newKey: "startTime" },
    { key: "پایان زمان شات لیست", newKey: "endTime" },
    { key: "موضوع", newKey: "categories" }, // multi
    { key: "شرح نریشن", newKey: "narrationDescription" },
    { key: "شرح تصویر", newKey: "pictureDescription" },
    { key: "جنسیت", newKey: "gender" },
    { key: "ردیف سنی", newKey: "ageRange" },
    { key: "از تاریخ", newKey: "startDate" },
    { key: "تا تاریخ", newKey: "endDate" },

    { key: "مناسبت", newKey: "event", inputKey: "مناسبت" },
    { key: "اشخاصی که با آن ها مصاحبه شده است", newKey: "speakWithMan", inputKey: "اشخاصی که با آن ها مصاحبه شده است" },
    { key: "کلیدواژه های مصاحبه", newKey: "speakKeyword", inputKey: "کلیدواژه مصاحبه" },
    { key: "اشخاصی که در مورد آن ها صحبت شده است", newKey: "speakAboutMan", inputKey: "اشخاصی که در مورد آن ها صحبت شده است" },
    { key: "اشخاصی که در تصویر می بینید", newKey: "manInPicture", inputKey: "اشخاصی که در تصویر می بینید" },
    { key: "مکان فیلم", newKey: "loc", inputKey: "مکان فیلم" },
    { key: "مکان هایی که در مورد آن صحبت شده است", newKey: "speakAboutLoc", inputKey: "مکانهایی که در مورد آن صحبت شده است" },
    { key: "کلیدواژه های نریشن", newKey: "narrationKeyword", inputKey: "کلیدواژه های نریشن" },
    { key: "کلیدواژه های مهم", newKey: "keyword", inputKey: "کلیدواژه های مهم" },

    { key: "شهر یا کشور", newKey: "city" },
    { key: "نوع تصویر", newKey: "pictureType" },
    { key: "حرکت دوربین", newKey: "pictureMode" },
    { key: "نما", newKey: "pictureView" },
    { key: "روز/شب", newKey: "dayNight" },
    { key: "مالکیت", newKey: "owners" },
    { key: "آرشیوی", newKey: "isArchive" },
    { key: "ادغام", newKey: "related" },
    { key: "درجه کیفی", newKey: "qualityGrade" },
    { key: "توضیحات", newKey: "description" },
    { key: "کاربر", newKey: "userId" },
];

class ShotImportFile_Service extends Service {

    async storeExcelFile(req) {


        return new Promise(async (resolve, reject) => {
            try {
                const { file: excelFile, ...fields } = req.body

                const file = excelFile?.toBuffer()
                const originalFilename = excelFile?.filename
                if (!file) {
                    return reject(ErrorResult.badRequest("file is required!"))
                }
                const format = (originalFilename.split('.').reverse())[0];
                const fileName = Date.now() + '.' + format;
                const pathToExcelSection = path.join(__dirname, '..', '..', '..', 'tmp', 'excel');
                if (!fs.existsSync(pathToExcelSection)) {
                    fs.mkdirSync(pathToExcelSection, { recursive: true });
                }
                const newPath = path.join(pathToExcelSection, fileName);

                await pump(file, fs.createWriteStream(newPath));
                const model = new ShotImportFile_Service();
                model.importExcelFile(newPath).then(() => {
                    return resolve();
                }).catch(err => {
                    return reject(err);
                })
            } catch (error) {
                return reject(error);
            }
        })
        // return new Promise((resolve, reject) => {
        //     formData.parse(req, async function (err, fields, files) {
        //         try {
        //             const file = files.file[0];
        //             const oldPath = file.filepath;
        //             const format = (file.originalFilename.split('.').reverse())[0];
        //             const fileName = Date.now() + '.' + format;

        //             const pathToExcelSection = path.join(__dirname, '..', '..', '..', 'tmp', 'excel');
        //             fs.mkdirSync(pathToExcelSection, { recursive: true });

        //             const newPath = path.join(pathToExcelSection, fileName);
        //             fs.copyFile(oldPath, newPath, async function (err) {
        //                 if (err) {
        //                     return reject(ErrorResult.internal("Upload error!"))
        //                 }
        //                 const model = new ShotImportFile_Service();
        //                 model.importExcelFile(newPath).then(() => {
        //                     return resolve();
        //                 }).catch(err => {
        //                     return reject(err);
        //                 })
        //             });
        //         }
        //         catch (err) {
        //             return reject(err);
        //         }
        //     });
        // })
    }

    async validateExcelCol(cols) {
        const validCol = {};
        for (let j = 0; j < validColName.length; j++) {
            for (let i = 0; i < cols.length; i++) {
                if (cols[i] && cols[i] === validColName[j].key) {
                    if (validCol[validColName[j].newKey]) {
                        validCol[validColName[j].newKey].push(i);
                    }
                    else {
                        validCol[validColName[j].newKey] = [i];
                    }
                }
            }
        }

        return validCol
    }

    async importExcelFile(excelFile) {
        const rows = await readXlsxFile(fs.createReadStream(excelFile));
        const cols = await this.validateExcelCol(rows[0]);

        let bulkData = [];
        for (let i = 1; i < rows.length; i++) {
            bulkData.push(rows[i]);
            if (bulkData.length === 100) {
                await this.cleanDataToStoreInDB(bulkData, cols);
                bulkData = [];
            }
        }
        await this.cleanDataToStoreInDB(bulkData, cols);

        return;
    }

    async cleanDataToStoreInDB(rows, cols) {
        let cleanData = [];
        let videoFiles = [];

        const defaultValues = await ShotDefaultValueService.getDefault();

        const dataMustCreateInDB = {
            project: new Set(),
            frameRate: new Set(),
            frameWidth: new Set(),
            frameHeight: new Set(),
            aspectRatio: new Set(),
            format: new Set(),

            categories: new Set(),
            owners: new Set(),
            languages: new Set(),

            pictureView: new Set(),
            pictureType: new Set(),
            pictureMode: new Set(),
            dayNight: new Set(),
            soundQuality: new Set(),
            peopleWithAgeType: new Set(),

            locationTag: new Set(),
            eventTag: new Set(),
            tag: new Set(),
            city: new Set(),
        }

        for (let i = 0; i < rows.length; i++) {
            let folder = "";
            let originalFilename = "";

            try {
                const selectedRow = rows[i];

                const getValueOfRow = (key) => {
                    if (!cols[key]) {
                        return null;
                    }
                    if (cols[key].length === 1) {
                        return selectedRow[cols[key][0]];
                    }
                    else {
                        return cols[key].map(index => selectedRow[index]);
                    }
                }

                const checkAndSet = (key) => {
                    if (cols[key]) {
                        cols[key].forEach(index => {
                            if (selectedRow[index] !== null && selectedRow[index].toString().trim().length) {
                                dataMustCreateInDB[key].add(selectedRow[index]);
                                if (Array.isArray(cleanData[lastIndex][key])) {
                                    cleanData[lastIndex][key].push(selectedRow[index]);
                                }
                                else {
                                    cleanData[lastIndex][key] = selectedRow[index]
                                }
                            }
                        })
                    }
                }

                let lastIndex = cleanData.push({
                    categories: [],
                })
                lastIndex = lastIndex - 1;

                folder = getValueOfRow("folder");
                if (Array.isArray(folder)) {
                    folder = folder.filter(item => item).join("/");
                }

                if (folder) {
                    folder = `${getValueOfRow("project")}/${folder}`
                }
                else {
                    folder = getValueOfRow("project")
                }

                originalFilename = getValueOfRow("file");

                const videoFileInsert = {
                    originalPath: folder,
                    originalName: originalFilename,
                    project: getValueOfRow("project"),
                    frameRate: getValueOfRow("frameRate"),
                    width: getValueOfRow("frameWidth"),
                    height: getValueOfRow("frameHeight"),
                    aspectRatio: getValueOfRow("aspectRatio"),
                    format: getValueOfRow("format"),
                    userId: getValueOfRow("userId")
                };
                videoFileInsert.fullPath = `${videoFileInsert.originalPath}/${videoFileInsert.originalName}`;

                checkAndSet("project");
                checkAndSet("soundQuality");
                checkAndSet("frameRate");
                checkAndSet("frameWidth");
                checkAndSet("frameHeight");
                checkAndSet("aspectRatio");
                checkAndSet("format");
                checkAndSet("pictureType");
                checkAndSet("pictureMode");
                checkAndSet("pictureView");
                checkAndSet("dayNight");
                checkAndSet("owners");
                checkAndSet("categories");
                checkAndSet("city");

                const splitAndClean = (key, inDB) => {
                    if (cols[key]) {
                        cols[key].forEach(index => {
                            if (selectedRow[index]) {
                                let clean = selectedRow[index].split("، ").filter(item => item).map(item => item.trim());
                                cleanData[lastIndex][key] = clean;
                                clean.forEach(tag => dataMustCreateInDB[inDB].add(tag))
                            }
                        })
                    }
                }

                const tag = [
                    "speakWithMan",
                    "speakKeyword",
                    "speakAboutMan",
                    "manInPicture",
                    "narrationKeyword",
                    "keyword"
                ];
                const locTag = ["loc", "speakAboutLoc"];

                tag.forEach(key => splitAndClean(key, "tag"));
                locTag.forEach(key => splitAndClean(key, "locationTag"));
                splitAndClean('event', "eventTag");

                let dubbed = getValueOfRow("dubbed");
                if (!dubbed) {
                    dubbed = ["ندارد"];
                }
                else {
                    dubbed = dubbed.split("-").filter(item => item.length > 0).map(item => item.trim());
                }

                let mainLanguage = getValueOfRow("mainLanguage");
                if (!mainLanguage) {
                    mainLanguage = ["ندارد"];
                }
                else {
                    mainLanguage = mainLanguage.split("-").filter(item => item.length > 0).map(item => item.trim());
                }

                let subtitle = getValueOfRow("subtitle");
                if (!subtitle) {
                    subtitle = ["ندارد"];
                }
                else {
                    subtitle = subtitle.split("-").filter(item => item.length > 0).map(item => item.trim());
                }

                let narration = getValueOfRow("narration");
                if (!narration) {
                    narration = ["ندارد"];
                }
                else {
                    narration = narration.split("-").filter(item => item.length > 0).map(item => item.trim());
                }

                dubbed.filter(item => item !== "ندارد" && item !== "اهمیت ندارد").forEach(item => dataMustCreateInDB["languages"].add(item.trim()))
                mainLanguage.filter(item => item !== "ندارد" && item !== "اهمیت ندارد").forEach(item => dataMustCreateInDB["languages"].add(item.trim()))
                subtitle.filter(item => item !== "ندارد" && item !== "اهمیت ندارد").forEach(item => dataMustCreateInDB["languages"].add(item.trim()))
                narration.filter(item => item !== "ندارد" && item !== "اهمیت ندارد").forEach(item => dataMustCreateInDB["languages"].add(item.trim()))

                const qualityGrade_list = [
                    { value: 0, label: "ضعیف" },
                    { value: 1, label: "متوسط" },
                    { value: 2, label: "خوب" },
                    { value: 3, label: "عالی" },
                ]

                const qualityGrade = qualityGrade_list.find(item => item.label === getValueOfRow("qualityGrade"));
                const ageRangeDefaultValueId = defaultValues['ageRange'].find(item => item.key === getValueOfRow("ageRange"));
                const color = getValueOfRow("color").split("-");

                videoFiles.push(videoFileInsert)

                cleanData[lastIndex] = {
                    ...cleanData[lastIndex],
                    fullPath: videoFileInsert.fullPath,
                    title: originalFilename,
                    userId: getValueOfRow("userId"),
                    startDate: getValueOfRow("startDate"),
                    endDate: getValueOfRow("endDate"),
                    hasCameraShake: TypeTool.boolean2Int(getValueOfRow("hasCameraShake") === "دارد"),
                    hasLogo: TypeTool.boolean2Int(getValueOfRow("hasLogo") === "دارد"),
                    hasMusic: TypeTool.boolean2Int(getValueOfRow("hasMusic") === "دارد"),
                    color: color.length === 2 ? 1 : (color.length != 1 ? null : (color[0] === "رنگی" ? 0 : 2)),
                    pictureEnvironment: getValueOfRow("pictureEnvironment"),
                    startTime: this.getSeconde(getValueOfRow("startTime")),
                    endTime: this.getSeconde(getValueOfRow("endTime")),
                    narrationDescription: getValueOfRow("narrationDescription") ? getValueOfRow("narrationDescription") : "",
                    pictureDescription: getValueOfRow("pictureDescription") ? getValueOfRow("pictureDescription") : "",
                    description: getValueOfRow("description") ? getValueOfRow("description") : "",
                    gender: getValueOfRow("gender") === null ? null : (getValueOfRow("gender") === "آقا"),
                    ageRangeDefaultValueId: ageRangeDefaultValueId?.id ?? null,
                    isArchive: TypeTool.boolean2Int((getValueOfRow("isArchive") && getValueOfRow("isArchive").trim() !== "نیست")),
                    qualityGrade: qualityGrade?.value ?? null,
                    dubbed,
                    mainLanguage,
                    subtitle,
                    narration,
                }
            }
            catch (err) {
                logError("Excel", err)
                throw ErrorResult.badRequest(`خطا در فایل :${folder}/${originalFilename} - ${err.message} - ${err.stack}`)
            }
        }

        Object.keys(dataMustCreateInDB).forEach(key => {
            dataMustCreateInDB[key] = [...dataMustCreateInDB[key]]
        })

        dataMustCreateInDB["project"] = await this.getProjects(dataMustCreateInDB["project"]);
        dataMustCreateInDB["categories"] = await this.getCategories(dataMustCreateInDB["categories"]);
        dataMustCreateInDB["owners"] = await this.getOwners(dataMustCreateInDB["owners"]);
        dataMustCreateInDB["languages"] = await this.getLanguages(dataMustCreateInDB["languages"]);
        dataMustCreateInDB["city"] = await this.getCities(dataMustCreateInDB["city"]);

        dataMustCreateInDB["frameRate"] = await this.getDefaultValues(dataMustCreateInDB["frameRate"], "frameRate", defaultValues["frameRate"]);
        dataMustCreateInDB["frameWidth"] = await this.getDefaultValues(dataMustCreateInDB["frameWidth"], "frameWidth", defaultValues["frameWidth"]);
        dataMustCreateInDB["frameHeight"] = await this.getDefaultValues(dataMustCreateInDB["frameHeight"], "frameHeight", defaultValues["frameHeight"]);
        dataMustCreateInDB["aspectRatio"] = await this.getDefaultValues(dataMustCreateInDB["aspectRatio"], "aspectRatio", defaultValues["aspectRatio"]);
        dataMustCreateInDB["format"] = await this.getDefaultValues(dataMustCreateInDB["format"], "format", defaultValues["format"]);
        dataMustCreateInDB["dayNight"] = await this.getDefaultValues(dataMustCreateInDB["dayNight"], "dayNight", defaultValues["dayNight"]);
        dataMustCreateInDB["soundQuality"] = await this.getDefaultValues(dataMustCreateInDB["soundQuality"], "soundQuality", defaultValues["soundQuality"]);
        dataMustCreateInDB["pictureView"] = await this.getDefaultValues(dataMustCreateInDB["pictureView"], "pictureView", defaultValues["pictureView"]);
        dataMustCreateInDB["pictureType"] = await this.getDefaultValues(dataMustCreateInDB["pictureType"], "pictureType", defaultValues["pictureType"]);
        dataMustCreateInDB["pictureMode"] = await this.getDefaultValues(dataMustCreateInDB["pictureMode"], "pictureMode", defaultValues["pictureMode"]);

        dataMustCreateInDB["locationTag"] = await this.getTags([...dataMustCreateInDB["locationTag"], ...dataMustCreateInDB["city"].map(item => item.name)], 'location');
        dataMustCreateInDB["eventTag"] = await this.getTags(dataMustCreateInDB["eventTag"], 'event');
        dataMustCreateInDB["tag"] = await this.getTags(dataMustCreateInDB["tag"], 'normal');

        dataMustCreateInDB["allTags"] = [
            ...dataMustCreateInDB["locationTag"],
            ...dataMustCreateInDB["eventTag"],
            ...dataMustCreateInDB["tag"]
        ];

        const videoFilesInDB = await this.importVideoFileToDB(videoFiles, dataMustCreateInDB);

        await this.importShotDataToDB(cleanData, {
            ...dataMustCreateInDB,
            videoFile: videoFilesInDB
        });

        await this.updateShotCountVideoFile(videoFilesInDB);
    }

    async importVideoFileToDB(videoFiles, otherIds) {
        const uniqueVideoFiles = [];
        const uniqueVideoFilesFullPath = [];

        videoFiles.forEach(item => {
            if (!uniqueVideoFilesFullPath.includes(item.fullPath)) {
                uniqueVideoFiles.push(item);
                uniqueVideoFilesFullPath.push(item.fullPath);
            }
        })

        for (let i = 0; i < uniqueVideoFiles.length; i++) {
            const project = otherIds["project"].find(proj => proj.title === uniqueVideoFiles[i].project);

            const checkExist = await VideoFile.findOne({
                where: {
                    projectId: project.id,
                    originalName: uniqueVideoFiles[i].originalName,
                    originalPath: uniqueVideoFiles[i].originalPath,
                }
            });

            if (checkExist) {
                uniqueVideoFiles[i].id = checkExist.id;
            }
            else {
                const db = await VideoFile.create({
                    ...uniqueVideoFiles[i],
                    projectId: project.id,
                    name: "nothing",
                    path: "nothing",
                    status: 6
                });
                uniqueVideoFiles[i].id = db.id;

                emitter.emit('createVideoFromImportExcelShot', db.toJSON())

            }
        }

        return uniqueVideoFiles;
    }

    async importShotDataToDB(shots, otherIds) {
        const inputs = await ShotInputService.get();
        const tagInputs = inputs.filter(item => item.valuesFrom === "tag");

        for (let i = 0; i < shots.length; i++) {
            ["dayNight", "soundQuality"].forEach(key => {
                shots[i][key] = otherIds[key].find(item => shots[i][key] == item.key)?.value ?? null;
            });

            const cityOfShot = otherIds["city"].find(item => shots[i]["city"] == item.name) ?? null;
            shots[i]["cityId"] = cityOfShot?.id ?? null;
            shots[i]["pictureViewId"] = otherIds["pictureView"].find(item => shots[i]["pictureView"] == item.key)?.id ?? null;
            shots[i]["pictureTypeId"] = otherIds["pictureType"].find(item => shots[i]["pictureType"] == item.key)?.id ?? null;
            shots[i]["pictureModeId"] = otherIds["pictureMode"].find(item => shots[i]["pictureMode"] == item.key)?.id ?? null;
            shots[i]["ownerId"] = otherIds["owners"].find(item => shots[i]["owners"] == item.name)?.id ?? null;
            shots[i]["projectId"] = otherIds["project"].find(item => shots[i]["project"] == item.title)?.id ?? null;

            const videoFile = otherIds["videoFile"].find(item => item.fullPath === shots[i].fullPath);

            // Create shot
            const shot = await Shot.create({
                videoFileId: videoFile.id,
                ...shots[i],
                status: 'init-check'
            });

            // emitter.emit('importShotExcel', shot.toJSON())


            // Store categories relation
            const categoriesId = otherIds['categories'].filter(item => shots[i].categories.includes(item.name)).map(item => item.id);
            await shotService.updateShotCategories(shot.id, { categoriesId });

            // Store language relation
            let languages = {
                mainLanguage: otherIds["languages"].filter(item => shots[i]["mainLanguage"].includes(item.name)).map(item => item.id),
                dubbed: otherIds["languages"].filter(item => shots[i]["dubbed"].includes(item.name)).map(item => item.id),
                subtitle: otherIds["languages"].filter(item => shots[i]["subtitle"].includes(item.name)).map(item => item.id),
                narration: otherIds["languages"].filter(item => shots[i]["narration"].includes(item.name)).map(item => item.id),
            }
            Object.keys(languages).forEach(key => {
                if (shots[i][key][0] === 'اهمیت ندارد') {
                    languages[key] = null;
                }
            })
            await shotService.updateShotLanguage(shot, languages);

            // Store tag
            let tags = [];
            tagInputs.forEach(input => {
                let tagIds = [];
                const keyInVar = validColName.find(item => item.inputKey === input.title);
                if (input.title === "مکان فیلم" && cityOfShot?.name) {
                    if (Array.isArray(shots[i][keyInVar?.newKey])) {
                        shots[i][keyInVar?.newKey].push(cityOfShot?.name)
                    }
                    else {
                        shots[i][keyInVar?.newKey] = [cityOfShot?.name]
                    }
                }
                if (shots[i][keyInVar?.newKey]) {
                    for (let j = 0; j < shots[i][keyInVar.newKey].length; j++) {
                        let t = otherIds['allTags'].find(item => item.tag === shots[i][keyInVar.newKey][j]);
                        if (t) {
                            tagIds.push(t.id);
                        }
                    }
                    tags.push({ inputId: input.id, tagIds });
                }
            });
            await shotService.updateShotTag(shot.id, { tagInput: tags });
        }
    }

    async getTags(data, type = 'normal') {
        let importBulk = [];
        let addedTag = [];

        let exist = await TagService.getByAttribute("tag", data);
        const existTitle = exist.map(item => (item.toJSON()).tag);
        const notExistTags = data.filter(item => !existTitle.includes(item)).map(item => ({ tag: item.trim(), type }));
        notExistTags.forEach(tag => {
            if (!addedTag.includes(tag.tag)) {
                addedTag.push(tag.tag);
                importBulk.push(tag);
            }
        })


        for (let i = 0; i < importBulk.length; i++) {
            try {
                let newData = await TagService.createTag(importBulk[i]);
                exist.push(newData);
            }
            catch (err) {
                if (err.errors) {
                    err = new Error(JSON.stringify(err.errors))
                }
                logError("import tag", err, "import excel");
            }
        }

        return exist.map(item => item.toJSON());
    }

    async getProjects(projects) {
        const existProject = await projectService.getByAttribute("title", projects);
        const existProjectTitle = existProject.map(item => (item.toJSON()).title);
        const importBulk = projects.filter(item => !existProjectTitle.includes(item))

        for (let i = 0; i < importBulk.length; i++) {
            let proj = await projectService.createProject({ title: importBulk[i].trim() });
            existProject.push(proj);
        }

        return existProject.map(item => item.toJSON())
    }

    async getCategories(categories) {
        const existCategory = await CategoryService.getByAttribute("name", categories);
        const existCategoryTitle = existCategory.map(item => (item.toJSON()).name);
        const importBulk = categories.filter(item => !existCategoryTitle.includes(item))

        for (let i = 0; i < importBulk.length; i++) {
            let category = await CategoryService.create({ name: importBulk[i].trim() });
            existCategory.push(category)
        }

        return existCategory.map(item => item.toJSON());
    }

    async getOwners(data) {
        const exist = await OwnerService.getByAttribute("name", data);
        const existTitle = exist.map(item => (item.toJSON()).name);
        const importBulk = data.filter(item => !existTitle.includes(item))

        for (let i = 0; i < importBulk.length; i++) {
            let newData = await OwnerService.create({ name: importBulk[i].trim() });
            exist.push(newData)
        }

        return exist.map(item => item.toJSON());
    }

    async getLanguages(data) {
        const exist = await LanguageService.getByAttribute("name", data);
        const existTitle = exist.map(item => (item.toJSON()).name);
        const importBulk = data.filter(item => !existTitle.includes(item))

        for (let i = 0; i < importBulk.length; i++) {
            let newData = await LanguageService.create({ name: importBulk[i].trim() });
            exist.push(newData)
        }

        return exist.map(item => item.toJSON());
    }

    async getCities(data) {
        const exist = await CityService.getByAttribute("name", data);
        const existTitle = exist.map(item => (item.toJSON()).name);
        const importBulk = data.filter(item => !existTitle.includes(item))

        for (let i = 0; i < importBulk.length; i++) {
            let newData = await CityService.create({ name: importBulk[i].trim() });
            exist.push(newData)
        }

        return exist.map(item => item.toJSON());
    }

    async getDefaultValues(data, section, exist = []) {
        const existTitle = exist.map(item => item.key);
        const importBulk = data.filter(item => !existTitle.includes(item));

        for (let i = 0; i < importBulk.length; i++) {
            let newData = await ShotDefaultValueService.checkAndCreateDefaultValue({
                section,
                key: importBulk[i],
                value: importBulk[i]
            });
            exist.push(newData[0].toJSON());
        }

        return exist;
    }

    async updateShotCountVideoFile(videoFiles) {
        for (let i = 0; i < videoFiles.length; i++) {
            const shotCount = await Shot.count({ where: { videoFileId: videoFiles[i].id } });
            const video = await VideoFile.findOne({ where: { id: videoFiles[i].id } })
            video.shotCount = shotCount
            await video.save()

            emitter.emit('updateShotCountVideoFile', video.toJSON())
        }
    }

    getSeconde(time) {
        if (typeof time === 'string') {
            let split = time.split(":");
            split[0] = parseInt(split[0])
            split[1] = parseInt(split[1])
            split[2] = parseInt(split[2]);
            return (split[0] * 3600) + (split[1] * 60) + split[2];
        }

        try {
            return (time.getUTCHours() * 3600) + (time.getUTCMinutes() * 60) + time.getUTCSeconds();
        }
        catch (err) {
            return "";
        }
    }
}

module.exports = new ShotImportFile_Service()
