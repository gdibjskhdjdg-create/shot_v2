    // UPDATE `video_files` SET `fullInfo`= null WHERE status = 5 OR status = 3;
const path = require("path");
const fs = require("fs");
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { VideoFile } = require("../../../modules/_default/model");

(async () => {
    try {
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();

        const take = 100;
        let biggestId = 0;

        console.log("start update fullInfo of video")

        let count = 0;
        // const pathToStoreFile = path.join(__dirname, '..', '..', '..', appConfigs.MainFile_FOLDER_FROM_APP_ROOT);
        while (true) {
            const files = await VideoFile.findAll({
                where: {
                    id: { [Op.gt]: biggestId },
                    status: { [Op.in]: [3, 5] }
                },
                limit: +take,
                attributes: [
                    'id', 'path', 'name', 'fullInfo'
                ]
            });

            // console.log(11111, files[files.length - 1])
            // break;

            if (files.length === 0) {
                break;
            }

            for (const video of files) {
                try{
                    const res = await fs.writeFileSync(`${video.path}/${video.name}.json`, video.fullInfo);
                    console.log(`Store: ${video.id}`, video.path)
                    // video.fullInfo = null;
                    // await video.save()
                    break;
                }
                catch(err){
                    console.log(`ERR: (${video.id}):`, err)
                }
            }

            break;

            count += files.length
        }

        console.log(11111111, `${count} items is updated`)
    } catch (error) {
        console.log(44444444, error)
    }

    process.exit();
})()