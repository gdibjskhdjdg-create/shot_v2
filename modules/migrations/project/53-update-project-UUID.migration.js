'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("projects", "UUID", {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
            });
        } catch (err) {
            console.log(err);
            errorLog("[-] Error in 53-update-project-UUID.migration")
        }
    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("projects", "UUID");
        }
        catch (err) { }
    }
};