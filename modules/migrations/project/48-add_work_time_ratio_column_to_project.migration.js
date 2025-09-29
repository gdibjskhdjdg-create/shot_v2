'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("projects", "workTimeRatio", {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
                after: "duration",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in add workTimeRatio column in projects table")
        }

    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("projects", "workTimeRatio");
        }
        catch (err) { }

    }
};