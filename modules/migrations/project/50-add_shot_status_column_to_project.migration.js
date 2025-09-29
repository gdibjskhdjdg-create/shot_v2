'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("projects", "shotStatus", {
                type: Sequelize.STRING,
                allowNull: true,
                after: "duration",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in add shotStatus column in projects table")
        }

    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("projects", "shotStatus");
        }
        catch (err) { }

    }
};