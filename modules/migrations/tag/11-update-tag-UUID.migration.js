'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("tags", "UUID", {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
            });
        } catch (err) {
            console.log(err);
            errorLog("[-] Error in 12-update-tag-UUID.migration")
        }
    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("tags", "UUID");
        }
        catch (err) { }
    }
};