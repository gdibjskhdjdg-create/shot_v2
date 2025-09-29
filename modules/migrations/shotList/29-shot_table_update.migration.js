'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("shots", "projectId", {
                type: Sequelize.INTEGER,
                allowNull: true,
                after: "title",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in create projectId in shots table")
        }
        try {
            await queryInterface.addColumn("shots", "description", {
                type: Sequelize.TEXT,
                allowNull: true,
                after: "projectId",
            });
        }
        catch (err) {
            errorLog("[-] Error in create description in shots table")
        }
    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("shots", "description");
        }
        catch (err) { }
        try {
            await queryInterface.removeColumn("shots", "projectId");
        }
        catch (err) { }
    }
};