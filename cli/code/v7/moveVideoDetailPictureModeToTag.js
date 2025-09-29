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
        console.log('[+] videos move Picture mode to tags');
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();


        const pictureModes = await ShotDefaultValue.findAll({ where: { section: "pictureMode" } });
        const pictureModeNames = pictureModes.map(x => x.value);

        const tags = await Tag.findAll({ where: { tag: pictureModeNames } });
        const tagValues = new Set(tags.map(x => x.tag)); // Use Set for faster lookup
        let tagIds = tags.map(x => x.id);

        // Filter picture names that are not in tagValues
        const differentPictureNames = pictureModeNames.filter(pictureName => !tagValues.has(pictureName));

        if (differentPictureNames.length) {
            console.log(111111111, 'Creating tags from picture modes');
            const newTags = await Tag.bulkCreate(
                differentPictureNames.map(pName => ({ tag: pName, type: 'normal' })),
                { returning: true }
            );
            tagIds.push(...newTags.map(x => x.id));
        }

        // ==================== Attach tags to video detail ==============================================

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

            console.log(111111111, 'Fetched videos from id=' + biggestId);
            biggestId = Math.max(...videos.map(video => video.videoFileId)); // Update biggestId

            // Use bulk create for VideoDetailRelTag to reduce the number of queries
            const relTagsToCreate = [];
            for (const video of videos) {
                let pictureMode = pictureModes.find(x => x.id == video.pictureModeId)
                const tag = tags.find(x => x.tag == pictureMode.value)
                // console.log(333333333, video.videoFileId, tag.id, pictureMode.value)

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
