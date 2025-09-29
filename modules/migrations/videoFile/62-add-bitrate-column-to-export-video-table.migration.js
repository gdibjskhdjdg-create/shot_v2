'use strict';

const { toDefaultValue } = require("sequelize/lib/utils");
const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("export_video_files", "bitrate", {
                type: Sequelize.STRING,
                toDefaultValue: true,
                after: "isMute",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in add bitrate column in export_video_files table")
        }

    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("export_video_files", "bitrate");
        }
        catch (err) { }

    }
};