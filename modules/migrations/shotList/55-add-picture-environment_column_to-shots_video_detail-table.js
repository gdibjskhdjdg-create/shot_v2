'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("shots", "pictureEnvironment", {
                type: Sequelize.INTEGER,
                allowNull: true,
            });
        } catch (err) {
            console.log(err);
            errorLog("[-] Error in create pictureEnvironment to shots-table")
        }

        try {
            await queryInterface.addColumn("video_detail", "pictureEnvironment", {
                type: Sequelize.INTEGER,
                allowNull: true,

            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in create  pictureEnvironment to video_detail-table")
        }

    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("shots", "pictureEnvironment");
        }
        catch (err) { }

        try {
            await queryInterface.removeColumn("video_detail", "pictureEnvironment");
        }
        catch (err) { }

    }
};