'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.addColumn("video_files", "shotCount", {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                after: "projectId"
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in migrate 10-update_video.migration")
        }
    },
    async down(queryInterface, DataTypes) {
        try {
            await queryInterface.removeColumn("video_files", "shotCount");
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in reverse 10-update_video.migration")
        }
    }
};