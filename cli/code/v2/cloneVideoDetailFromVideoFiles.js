const path = require("path");
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { 
    VideoFile, 
    VideoDetailRelCategory, 
    VideoDetailRelTag, 
    VideoDetailRelLanguage,
    VideoDetailScore,
    VideoDetail, 
    Shot, 
    ShotScore, 
    Category, 
    ShotRelTag, 
    ShotRelLanguage 
} = require("../../../modules/_default/model");
const { shotService } = require("../../../modules/services/videoDetail/index");
const { VideoDetailStatus_Enum, VideoDetailShotStatus_Enum } = require("../../../modules/models/videoDetail/enum/VideoDetail.enum");

(async () => {
    try {
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();

        const take = 500;
        const videoDetailStatus = "init";
        // let biggestId = 0;
        let biggestId = 47943;

        while (true) {
            const items = await VideoFile.findAll({
                where: {
                    id: { [Op.gt]: biggestId },
                },
                limit: +take,
            });

            if (items.length === 0) {
                break;
            }

            const videosId = items.map((x => x.id));
            const details = (await VideoDetail.findAll({ where: { videoFileId: videosId } })).map(x => x.toJSON());

            const bulkParams = [];
            const bulkCategory = [];
            const bulkTag = [];
            const bulkLanguage = [];
            const bulkScore = [];
            for (const item of items) {
                biggestId = item.id;

                if (!details.find(x => x.videoFileId == item.id)) {
                    const shotVideoStatus = await shotService.getShotVideoFileStatus(item.id);
                    let shotStatus = VideoDetailShotStatus_Enum.initCheck.value;
                    if (shotVideoStatus.length) {
                        if (shotVideoStatus.includes(VideoDetailShotStatus_Enum.initCheck.value)) {
                            shotStatus = VideoDetailShotStatus_Enum.initCheck.value;
                        } else if (shotVideoStatus.includes(VideoDetailShotStatus_Enum.equalizing.value)) {
                            shotStatus = VideoDetailShotStatus_Enum.equalizing.value;
                        } else {
                            shotStatus = VideoDetailShotStatus_Enum.equalized.value;
                        }
                    }

                    let firstShot = await Shot.findOne({
                        where: { videoFileId: item.id },
                        include: [
                            { model: Category, attributes: ['id', 'name'], as: 'category' },
                            { model: ShotRelTag, as: 'tagIds' },
                            { model: ShotRelLanguage, as: 'languageIds' },
                            { model: ShotScore, as: 'score' },
                        ]
                    })

                    if(firstShot) firstShot = firstShot.toJSON();
                    else firstShot = {}

                    if(firstShot?.category){
                        firstShot?.category.forEach(it => {
                            bulkCategory.push({
                                videoFileId: item.id, 
                                categoryId: it.id
                            })
                        })
                    }

                    if(firstShot?.tagIds){
                        firstShot?.tagIds.forEach(it => {
                            bulkTag.push({ ...it, videoFileId: item.id })
                        })
                    }

                    if(firstShot?.languageIds){
                        firstShot?.languageIds.forEach(it => {
                            bulkLanguage.push({ ...it, videoFileId: item.id })
                        })
                    }

                    if(firstShot?.score){
                        firstShot?.score.forEach(it => {
                            delete it.id 
                            bulkScore.push({ ...it, videoFileId: item.id })
                        })
                    }

                    bulkParams.push({
                        ...firstShot, 
                        videoFileId: item.id, 
                        status: videoDetailStatus, 
                        shotStatus, 
                        title: item.originalName,
                        userId: item.userId,
                        projectId: item.projectId
                    })
                }
            }
            await VideoDetail.bulkCreate(bulkParams);
            await VideoDetailRelCategory.bulkCreate(bulkCategory);
            await VideoDetailRelTag.bulkCreate(bulkTag);
            await VideoDetailRelLanguage.bulkCreate(bulkLanguage);
            await VideoDetailScore.bulkCreate(bulkScore);

            console.log(11111111111111111, biggestId)
        }
    }
    catch (err) {
        console.log(err)
    }

    process.exit();
})();