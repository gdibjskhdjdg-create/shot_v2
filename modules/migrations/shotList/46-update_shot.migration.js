'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.addColumn("shots", "rate", {
                type: DataTypes.INTEGER,
                allowNull: true,
                after: "lastEqualizeLogId",
            },);
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in 46-update_shot.migration - rate")
        }
    },
    async down(queryInterface, DataTypes) {
        try {
            await queryInterface.removeColumn("shots", "rate");
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in reverse 46-update_shot.migration - rate")
        }
    }
};