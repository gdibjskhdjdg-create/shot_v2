'use strict';

const { toDefaultValue } = require("sequelize/lib/utils");
const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("video_template", "bitrate", {
                type: Sequelize.STRING,
                toDefaultValue: true,
                after: "isMute",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in add bitrate column in video_template table")
        }

    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("video_template", "bitrate");
        }
        catch (err) { }

    }
};