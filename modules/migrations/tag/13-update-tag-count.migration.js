'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("tags", "count", {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false,
            });
        } catch (err) {
            console.log(err);
            errorLog("[-] Error in 13-update-tag-count.migration")
        }
    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("tags", "UUID");
        }
        catch (err) { }
    }
};