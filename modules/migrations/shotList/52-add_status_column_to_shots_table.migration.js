'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("shots", "status", {
                type: Sequelize.STRING(30),
                allowNull: true,
                after: "endDate",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in add status column in shots table")
        }

    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("shots", "status");
        }
        catch (err) { }

    }
};