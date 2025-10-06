'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("keywords", "UUID", {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
            });
        } catch (err) {
            console.log(err);
            errorLog("[-] Error in 12-update-keyword-UUID.migration")
        }
    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("keywords", "UUID");
        }
        catch (err) { }
    }
};