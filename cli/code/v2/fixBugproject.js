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
const { VideoDetailShotStatus_Enum, VideoDetailStatus_Enum } = require("../../../modules/models/videoDetail/enum/VideoDetail.enum");

(async () => {
    try {
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();

        const projectId = 150;

        const items = await VideoDetail.findAll({
            where: { projectId },
            include: [
                { model: Shot, as: 'shots' },
            ]
        });

        const cleaningIds = items.filter(it => it.toJSON().shots.length > 0).map(it => it.videoFileId);
        const initIds = items.filter(it => it.toJSON().shots.length === 0).map(it => it.videoFileId);

        await VideoDetail.update({ status: VideoDetailStatus_Enum.cleaning.value, shotStatus: VideoDetailShotStatus_Enum.initCheck.value}, { where: { videoFileId: cleaningIds }});
        await VideoDetail.update({ status: VideoDetailStatus_Enum.init.value, shotStatus: VideoDetailShotStatus_Enum.initCheck.value}, { where: { videoFileId: initIds }});
    }
    catch (err) {
        console.log(err)
    }

    process.exit();
})();