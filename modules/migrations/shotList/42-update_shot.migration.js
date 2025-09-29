'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.addColumn("shots", "gallery", {
                type: DataTypes.TEXT,
                allowNull: true,
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in 42-update_shot.migration")
        }
    },
    async down(queryInterface, DataTypes) {
        try {
            await queryInterface.removeColumn("shots", "gallery");
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in reverse 42-update_shot.migration")
        }
    }
};