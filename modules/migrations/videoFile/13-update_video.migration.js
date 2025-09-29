'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.addColumn("video_files", "referralAt", {
                type: DataTypes.DATE,
                allowNull: true,
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in migrate 13-update_video.migration")
        }
    },
    async down(queryInterface, DataTypes) {
        try {
            await queryInterface.removeColumn("video_files");
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in reverse 13-update_video.migration")
        }
    }
};