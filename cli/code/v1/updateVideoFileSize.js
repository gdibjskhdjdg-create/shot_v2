'use strict';
const path = require("path");
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");

const { Op } = require("sequelize");

const { VideoFile } = require("../../../modules/_default/model");

(async () => {
    try {
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();
        
        // Define pagination parameters
        let pageIndex = 0; // Current page number
        const pageSize = 200; // Records per page
        let countUpdated = 0

        while (1) {
            const data = await VideoFile.findAndCountAll({
                where: {
                    fullInfo: { [Op.not]: null },
                    size: null
                },
                limit: pageSize,
                // offset: pageIndex * pageSize, // Calculate offset
            })

            const rows = data.rows
            const total = data.count

            countUpdated += rows.length

            if (rows.length == 0) {
                break
            }

            for (const video of rows) {
                const fullInfo = JSON.parse(video.fullInfo)
                const generalDetail = fullInfo.track.find(item => item["@type"] === "General");
                const fileSize = (generalDetail?.FileSize ?? null)
                video.size = fileSize;
                await video.save()
            }

            console.log(111111111, 'save size of video file', `${countUpdated} of ${total} is updated`)

            pageIndex++
        }
    }
    catch (err) {

    }
})();