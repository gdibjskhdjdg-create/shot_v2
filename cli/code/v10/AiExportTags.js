    // UPDATE `video_files` SET `fullInfo`= null WHERE status = 5 OR status = 3;
const path = require("path");
const fs = require("fs");
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { VideoDetail, VideoDetailRelTag } = require("../../../modules/_default/model");
const { videoDetailService } = require("../../../modules/services/videoDetail");

(async () => {
    try {
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();

        console.log("start Export ai tags")

        const tags = await VideoDetailRelTag.findAll({
            where: {
                inputId: 11
            }
        })

        const videoIds = [...new Set(tags.map(item => item.videoFileId))];
        const videos = await videoDetailService.detail(videoIds)
        // const videos = await VideoDetail.findAll({
        //     where: {
        //         videoFileId: videoIds
        //     },
        //     include: [{

        //     }],
        //     attributes: ['videoFileId', 'title']
        // })

        const validData = videos.map(item => ({
            id: item.videoFileId,
            title: item.title,
            aiTag:  item.allTags.map(it => ({tag: it.tag, inputId: it.VideoDetailRelTag.inputId})).filter(it => it.inputId === 11).map(it => it.tag).join(" | "),
            tags: item.allTags.map(it => ({tag: it.tag, inputId: it.VideoDetailRelTag.inputId})).filter(it => it.inputId !== 11).map(it => it.tag).join(" | "),
        }))

        try{
            const res = await fs.writeFileSync(path.join(__dirname, '..', '..', '..', 'tmp', 'aitags.json'), JSON.stringify(validData));
        }
        catch(err){
            console.log(`ERR:`, err)
        }

    } catch (error) {
        console.log(44444444, error)
    }

    process.exit();
})()