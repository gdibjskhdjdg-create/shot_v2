'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("projects", "equalizeRatio", {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
                after: "workTimeRatio",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in add equalizeRatio column in projects table")
        }

    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("projects", "equalizeRatio");
        }
        catch (err) { }

    }
};