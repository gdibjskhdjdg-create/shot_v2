'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("shots", "UUID", {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
            });
        } catch (err) {
            console.log(err);
            errorLog("[-] Error in 56-update-shot-UUID.migration")
        }
    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("shots", "UUID");
        }
        catch (err) { }
    }
};