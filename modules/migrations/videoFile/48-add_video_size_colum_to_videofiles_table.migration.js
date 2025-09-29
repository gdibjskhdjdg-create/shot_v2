'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("video_files", "size", {
                type: Sequelize.BIGINT,
                allowNull: true,
                after: "duration",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in add size in videofiles table")
        }

    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("video_files", "size");
        }
        catch (err) { }

    }
};