'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.changeColumn("shot_log", "startTime", {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
            },);
            await queryInterface.changeColumn("shot_log", "endTime", {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
            },);
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in 49-update_shot-log.migration - times")
        }
    },
    async down(queryInterface, DataTypes) {
    }
};