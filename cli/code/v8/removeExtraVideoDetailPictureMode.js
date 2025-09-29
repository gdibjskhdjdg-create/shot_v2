const path = require("path");
const fs = require("fs");
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { VideoDetail, ShotDefaultValue, VideoDetailRelTag, Tag, sequelize } = require("../../../modules/_default/model");

(async () => {
    try {
        console.log('[+] video detail restore Picture mode');
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();


        // create tags from picture modes
        const pictureModes = await ShotDefaultValue.findAll({ where: { section: "pictureMode" } });
        const pictureModeNames = pictureModes.map(x => x.value);

        const tags = await Tag.findAll({ where: { tag: pictureModeNames } });

        // ==================== Attach tags to shots ==============================================

        const take = 500;
        let biggestId = 0;

        while (true) {
            const videos = await VideoDetail.findAll({
                where: {
                    videoFileId: { [Op.gt]: biggestId },
                    pictureModeId: { [Op.not]: null }
                },
                limit: take,
            });

            if (videos.length === 0) {
                break;
            }

            console.log(111111111, 'Fetched video details from id=' + biggestId);
            biggestId = Math.max(...videos.map(video => video.videoFileId)); // Update biggestId

            for (const video of videos) {
                // let pictureMode = pictureModes.find(x => x.id == video.pictureModeId)
                let excludeModes = (pictureModes.filter(x => x.id != video.pictureModeId))
                let excludePictureModesNames = excludeModes.map(x => x.value)
                // let pictureModesIds = excludeModes.map(x => x.id)
                const excludeTags = tags.filter(x => excludePictureModesNames.includes(x.tag))
                // const findTag = tags.find(x => x.tag == pictureMode.value)

                // console.log(99999999, video.videoFileId, findTag.toJSON(), pictureMode.toJSON())
                // console.log(22222222, pictureModesIds, excludePictureModesNames, excludeTags.map(x => x.id), excludeTags.map(x => x.tag))
                // console.log(1111111111, "============================")
                for (const tag of excludeTags) {
                    await VideoDetailRelTag.destroy({
                        where: {
                            videoFileId: video.videoFileId,
                            tagId: tag.id
                        }
                    })
                }

            }


        }

    } catch (err) {
        console.error('Error occurred:', err); // Log the error for debugging
    } finally {
        process.exit();
    }
})();
