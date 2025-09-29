'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("export_video_files", "deletedAt", {
                type: Sequelize.DATE,
                allowNull: true,
                after: "updatedAt",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in add deletedAt column in export_video_files table")
        }

    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("export_video_files", "deletedAt");
        }
        catch (err) { 

            console.log(err);
            errorLog("[-] Error in delete deletedAt column from export_video_files table")
        }

    }
};