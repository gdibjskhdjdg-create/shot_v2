'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.changeColumn("shots", "startTime", {
                type: DataTypes.STRING(20),
                allowNull: true
            });
            await queryInterface.changeColumn("shots", "endTime", {
                type: DataTypes.STRING(20),
                allowNull: true
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in update startTime in shots table")
        }
    },
    async down(queryInterface, DataTypes) {
        try {
            await queryInterface.changeColumn("shots", "startTime", {
                type: DataTypes.INTEGER,
                allowNull: true
            });
            await queryInterface.changeColumn("shots", "endTime", {
                type: DataTypes.INTEGER,
                allowNull: true
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in update startTime in shots table")
        }
    }
};