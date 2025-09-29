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

        // if (!appConfigs.MainFile_FOLDER_FROM_APP_ROOT) {
        //     console.log("ERROR: appConfigs.MainFile_FOLDER_FROM_APP_ROOT")
        //     process.exit();
        // }
        console.log("start update bitrate of video files")

        let count = 0;
        // const pathToStoreFile = path.join(__dirname, '..', '..', '..', appConfigs.MainFile_FOLDER_FROM_APP_ROOT);
        while (true) {
            const files = await VideoFile.findAll({
                where: {
                    id: { [Op.gt]: biggestId },
                    bitrate: null
                },
                limit: +take,
                attributes: ['id', 'fullInfo']
            });

            if (files.length === 0) {
                break;
            }


            for (const video of files) {

                biggestId = video.id;

                const mediaInfoData = JSON.parse(video.fullInfo);
                video.bitrate = mediaInfoData.track.find(item => item["@type"] === "Video")?.BitRate ?? null ;
                await video.save()

            }

            count += files.length



        }

        console.log(11111111, `${count} items is updated`)


    } catch (error) {

        console.log(44444444, error)
    }

    process.exit();
})()