'use strict';

const { errorLog } = require("../../../helper/showLog");
const CreateTable = require("../../_default/migrate");
const VideoDetailLogSchema = require("../../models/videoDetail/schema/VideoDetailLog.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.renameColumn("video_detail", "rejectDescription", "cleaningDescription");
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in 73-update-video_detail.migration - rename")
        }
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.renameColumn("video_detail", "cleaningDescription", "rejectDescription");
    }
};