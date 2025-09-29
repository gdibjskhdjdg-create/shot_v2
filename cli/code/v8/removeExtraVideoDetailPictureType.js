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
        console.log('[+] video detail restore Picture type');
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();


        // create tags from picture types
        const pictureTypes = await ShotDefaultValue.findAll({ where: { section: "pictureType" } });
        const pictureTypeNames = pictureTypes.map(x => x.value);

        const tags = await Tag.findAll({ where: { tag: pictureTypeNames } });


        const take = 500;
        let biggestId = 0;

        while (true) {
            const videos = await VideoDetail.findAll({
                where: {
                    videoFileId: { [Op.gt]: biggestId },
                    pictureTypeId: { [Op.not]: null }
                },
                limit: take,
            });

            if (videos.length === 0) {
                break;
            }

            console.log(111111111, 'Fetched video detail from id=' + biggestId);
            biggestId = Math.max(...videos.map(video => video.videoFileId)); // Update biggestId

            for (const video of videos) {
                // let pictureType = pictureTypes.find(x => x.id == video.pictureTypeId)
                let excludeTypes = (pictureTypes.filter(x => x.id != video.pictureTypeId))
                let excludePictureTypesNames = excludeTypes.map(x => x.value)
                // let pictureTypesIds = excludeTypes.map(x => x.id)
                const excludeTags = tags.filter(x => excludePictureTypesNames.includes(x.tag))
                // const findTag = tags.find(x => x.tag == pictureType.value)

                // console.log(99999999, video.videoFileId, findTag.toJSON(), pictureType.toJSON())
                // console.log(22222222, pictureTypesIds, excludePictureTypesNames, excludeTags.map(x => x.id), excludeTags.map(x => x.tag))
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
