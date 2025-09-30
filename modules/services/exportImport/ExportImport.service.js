const path = require('path');
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
const TagService = require('../tag/Tag.service');
const { encryptFile, decryptFile } = require('../../../helper/fileEncryption.tool');
const CategoryService = require('../category/Category.service');
const ShotInputService = require('../shotList/ShotInput.service');
const { findOrCreateDefaultValue } = require('../shotList/ShotDefaultValue.service');
const { checkAndUpdateWithUUID } = require('../project/index');
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

        this.folderToStore = "excel";
        this.fullPathToStore = path.join(__dirname, '..', '..', '..', appConfigs.STORE_FOLDER_FROM_APP_ROOT, this.folderToStore);
        if (!fs.existsSync(this.fullPathToStore)) {
            fs.mkdirSync(this.fullPathToStore, { recursive: true });
        }
    }

    async importFullDataFile(fileName, filePath) {
        const pathToStore = path.join(appConfigs.BASE_PATH, process.env.STORE_FOLDER_FROM_APP_ROOT, "import_full_data");
        const output = path.join(pathToStore, `${Math.floor(Math.random() * 100000000)}.json`);
        await decryptFile(filePath, output);
        const data = await fsPromise.readFile(output, 'utf8').then(data => JSON.parse(data));

        const projects = await checkAndUpdateWithUUID(data.projects);
        const tags = await TagService.syncWithUUID(data.tags);
        const categories = await CategoryService.checkAndUpdateWithUUID(data.categories);
        const languages = await LanguageService.checkAndUpdateWithUUID(data.languages);

        const videoDetailIds = await this.importFullDataVideoFromOtherServer({ projects, tags, categories, languages }, data.videoDetails);
        await this.importShotFullDataFromOtherServer({ projects, tags, categories, languages }, videoDetailIds, data.shots);

        await TagService.updateTagCount(tags.map(item => item.id));

        return {};
    }
}

module.exports = ExportImportService;