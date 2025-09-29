const path = require("path");
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { VideoDetail, VideoDetailScore } = require("../../../modules/_default/model");
const RashGateway = require("../../../gateway/Rash.gateway");
const { videoDetailScoreService } = require("../../../modules/services/videoDetail");

(async () => {
    try {
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();

        const videoDetails = await VideoDetail.findAll({ where: { projectId: 184, status: ["cleaning"]}});

        const scores = [
            {key: "content", value: 2},
            {key: "place", value: 2},
            {key: "rare", value: 2},
            {key: "risk", value: 0},
            {key: "image-quality", value: 1},
            {key: "sound", value: 0},
            {key: "usability", value: 2},
            {key: "light", value: 2},
            {key: "popular", value: 0},
        ]

        const userId = 10;
        for(let i = 0; i < videoDetails.length; i++){
            const videoFileId = videoDetails[i].videoFileId;

            console.log(i, videoDetails.length, videoFileId)
            for (const score of scores) {
                const section = 'shot-main-score'
                const findScore = await VideoDetailScore.findOne({
                    where: { videoFileId, scoreKey: score.key, section }, // Search for existing record by this value
                });
    
                if (!findScore) {
                    await VideoDetailScore.create({ videoFileId, userId, scoreKey: score.key, score: score.value, section })
                } else {
                    await VideoDetailScore.update({ score: score.value }, { where: { videoFileId, scoreKey: score.key, section } })
                }
            }
        }
        // await videoDetailScoreService.storeScore({ user: { id: }, videoFileId, scores })
        
        console.log(111111, videoDetails.length)
    }
    catch (err) {
        console.log(err)
    }

    process.exit();
})()
