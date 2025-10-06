'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("keywords", "count", {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false,
            });
        } catch (err) {
            console.log(err);
            errorLog("[-] Error in 13-update-keyword-count.migration")
        }
    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("keywords", "UUID");
        }
        catch (err) { }
    }
};