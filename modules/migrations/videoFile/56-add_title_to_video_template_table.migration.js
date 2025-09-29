'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("video_template", "title", {
                type: Sequelize.TEXT,
                allowNull: false,
                after: "id",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in add title column in video_template table")
        }

    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("video_template", "title");
        }
        catch (err) { }

    }
};