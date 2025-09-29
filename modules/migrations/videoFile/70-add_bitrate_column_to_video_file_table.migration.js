'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("video_files", "bitrate", {
                type: Sequelize.STRING(20),
                allowNull: true,
                after: "aspectRatio",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in add bitrate column in video_files table")
        }

    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("video_files", "bitrate");
        }
        catch (err) { }

    }
};