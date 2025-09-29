'use strict';

const { toDefaultValue } = require("sequelize/lib/utils");
const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("video_files", "isImportant", {
                type: Sequelize.SMALLINT,
                defaultValue: 0,
                after: "status",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in add isImportant column in video_files table")
        }

    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("video_files", "isImportant");
        }
        catch (err) { }

    }
};