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
        console.log('[+] video move Picture type to tags');
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();

        const pictureTypes = await ShotDefaultValue.findAll({ where: { section: "pictureType" } });
        const pictureTypeNames = pictureTypes.map(x => x.value);

        const tags = await Tag.findAll({ where: { tag: pictureTypeNames } });
        const tagValues = new Set(tags.map(x => x.tag)); // Use Set for faster lookup
        let tagIds = tags.map(x => x.id);

        // Filter picture types that are not in tagValues
        const differentPictureTypes = pictureTypeNames.filter(pictureName => !tagValues.has(pictureName));

        if (!!differentPictureTypes?.length) {
            console.log(111111111, 'Creating tags from picture types');
            const newTags = await Tag.bulkCreate(
                differentPictureTypes.map(pType => ({ tag: pType, type: 'normal' })),
                { returning: true }
            );
            tagIds.push(...newTags.map(x => x.id));
        }


        // ==================== Attach tags to shots ==============================================

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

            console.log(111111111, 'Fetched video from id=' + biggestId);
            biggestId = Math.max(...videos.map(video => video.videoFileId)); // Update biggestId

            // Use bulk create for VideoDetailRelTag to reduce the number of queries
            const relTagsToCreate = [];
            for (const video of videos) {
                let pictureType = pictureTypes.find(x => x.id == video.pictureTypeId)
                const tag = tags.find(x => x.tag == pictureType.value)
                // console.log(333333333, video.videoFileId, tag.id, pictureType.value)

                const relTag = await VideoDetailRelTag.findOne({ where: { videoFileId: video.videoFileId, tagId : tag.id } })
                if (!relTag) {
                    relTagsToCreate.push({
                        videoFileId: video.videoFileId,
                        tagId : tag.id,
                        inVideo: 0,
                        otherInfo: null,
                        inputId: 9 // کلید واژه های مهم
                    });
                }

            }

            // Bulk create relationships
            if (!!relTagsToCreate?.length) {
                console.log(111111111, 'Attaching new tags to videos');
                await VideoDetailRelTag.bulkCreate(relTagsToCreate /** , { ignoreDuplicates: true } */);
            }
        }

    } catch (err) {
        console.error('Error occurred:', err); // Log the error for debugging
    } finally {
        process.exit();
    }
})();
