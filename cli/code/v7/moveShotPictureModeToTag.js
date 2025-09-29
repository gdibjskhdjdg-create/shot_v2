const path = require("path");
const fs = require("fs");
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { Shot, ShotDefaultValue, ShotRelTag, Tag, sequelize } = require("../../../modules/_default/model");

(async () => {
    try {
        console.log('[+] Shot move Picture mode to tags');
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();


        // create tags from picture modes
        const pictureModes = await ShotDefaultValue.findAll({ where: { section: "pictureMode" } });
        const pictureModeNames = pictureModes.map(x => x.value);

        const tags = await Tag.findAll({ where: { tag: pictureModeNames } });
        const tagValues = new Set(tags.map(x => x.tag)); // Use Set for faster lookup
        let tagIds = tags.map(x => x.id);

        // Filter picture names that are not in tagValues
        const differentPictureNames = pictureModeNames.filter(pictureName => !tagValues.has(pictureName));

        if (!!differentPictureNames?.length) {
            console.log(111111111, 'Creating tags from picture modes');
            const newTags = await Tag.bulkCreate(
                differentPictureNames.map(pName => ({ tag: pName, type: 'normal' })),
                { returning: true }
            );
            tagIds.push(...newTags.map(x => x.id));
        }


        // ==================== Attach tags to shots ==============================================

        const take = 500;
        let biggestId = 0;

        // attach tags to shots
        while (true) {
            const shots = await Shot.findAll({
                where: {
                    id: { [Op.gt]: biggestId },
                    pictureModeId: { [Op.not]: null }
                },
                limit: take,
            });

            if (shots.length === 0) {
                break;
            }

            console.log(111111111, 'Fetched shots from id=' + biggestId);
            biggestId = Math.max(...shots.map(shot => shot.id)); // Update biggestId

            // Use bulk create for ShotRelTag to reduce the number of queries
            const relTagsToCreate = [];
            for (const shot of shots) {
                let pictureMode = pictureModes.find(x => x.id == shot.pictureModeId)
                const tag = tags.find(x => x.tag == pictureMode.value)
                // console.log(333333333, shot.id, tag.id, pictureMode.value)

                const relTag = await ShotRelTag.findOne({ where: { shotId: shot.id, tagId: tag.id } })
                if (!relTag) {
                    relTagsToCreate.push({
                        shotId: shot.id,
                        tagId: tag.id,
                        inVideo: 0,
                        otherInfo: null,
                        inputId: 9 // کلید واژه های مهم
                    });
                }
                // }
            }

            // Bulk create relationships
            if (!!relTagsToCreate?.length) {
                console.log(111111111, 'Attaching new tags to shots');
                await ShotRelTag.bulkCreate(relTagsToCreate /** , { ignoreDuplicates: true } */);
            }
        }

    } catch (err) {
        console.error('Error occurred:', err); // Log the error for debugging
    } finally {
        process.exit();
    }
})();
