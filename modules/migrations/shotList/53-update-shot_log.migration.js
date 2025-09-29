'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.changeColumn("shot_log", "mode", {
                type: Sequelize.STRING(30),
                defaultValue: 'init-check',
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in 53-update-shot_log.migration")
        }

    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("shots", "status");
        }
        catch (err) { }

    }
};