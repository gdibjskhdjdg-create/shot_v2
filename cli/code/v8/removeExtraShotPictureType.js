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
        console.log('[+] Shot restore Picture type');
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();


        // create tags from picture types
        const pictureTypes = await ShotDefaultValue.findAll({ where: { section: "pictureType" } });
        const pictureTypeNames = pictureTypes.map(x => x.value);

        const tags = await Tag.findAll({ where: { tag: pictureTypeNames } });

        // ==================== Attach tags to shots ==============================================

        const take = 500;
        let biggestId = 0;

        while (true) {
            const shots = await Shot.findAll({
                where: {
                    id: { [Op.gt]: biggestId },
                    pictureTypeId: { [Op.not]: null }
                },
                limit: take,
            });

            if (shots.length === 0) {
                break;
            }

            console.log(111111111, 'Fetched shots from id=' + biggestId);
            biggestId = Math.max(...shots.map(shot => shot.id)); // Update biggestId

            for (const shot of shots) {
                // let pictureType = pictureTypes.find(x => x.id == shot.pictureTypeId)
                let excludeTypes = (pictureTypes.filter(x => x.id != shot.pictureTypeId))
                let excludePictureTypesNames = excludeTypes.map(x => x.value)
                // let excludePictureTypesIds = excludeTypes.map(x => x.id)
                const excludeTags = tags.filter(x => excludePictureTypesNames.includes(x.tag))
                // const findTag = tags.find(x => x.tag == pictureType.value)

                // console.log(99999999, shot.id, findTag.toJSON(), pictureType.toJSON())
                // console.log(22222222, excludePictureTypesIds, excludePictureTypesNames, excludeTags.map(x => x.id), excludeTags.map(x => x.tag))
                // console.log(1111111111, "============================")
                for (const tag of excludeTags) {
                    await ShotRelTag.destroy({
                        where: {
                            shotId: shot.id,
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
