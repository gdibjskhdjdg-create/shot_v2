'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.renameColumn('video_files', 'userIdMustBeAssigned', 'userId');
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in migrate 11-update_video.migration")
        }
    },
    async down(queryInterface, DataTypes) {
        try {
            await queryInterface.renameColumn('video_files', 'userId', 'userIdMustBeAssigned');
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in reverse 11-update_video.migration")
        }
    }
};