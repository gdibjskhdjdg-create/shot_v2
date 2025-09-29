'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.addColumn("shots", "lastEqualizeLogId", {
                type: DataTypes.INTEGER,
                after: "endDate",
                allowNull: true,
                references: {
                    model: "equalizer_log",
                    keys: "id",
                    as: "equalizer_log",
                },
                onUpdate: "SET NULL",
                onDelete: "SET NULL",
            },);
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in 45-update_shot.migration - lastEqualizeLogId")
        }
    },
    async down(queryInterface, DataTypes) {
        try {
            await queryInterface.removeColumn("shots", "lastEqualizeLogId");
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in reverse 45-update_shot.migration - lastEqualizeLogId")
        }
    }
};