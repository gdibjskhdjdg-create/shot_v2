'use strict';
const { Op } = require("sequelize");
const { VideoFile } = require("../../_default/model");



module.exports = {
    async up() {
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
        }
    },
    async down() {

    }
};