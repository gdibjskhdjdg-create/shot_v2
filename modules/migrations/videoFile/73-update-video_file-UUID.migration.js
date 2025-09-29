'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("video_files", "UUID", {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
            });
        } catch (err) {
            console.log(err);
            errorLog("[-] Error in 73-update-video_file-UUID.migration")
        }
    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("video_files", "UUID");
        }
        catch (err) { }
    }
};