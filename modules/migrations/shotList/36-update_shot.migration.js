'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.addColumn("shots", "userId", {
                type: DataTypes.INTEGER,
                allowNull: true,
                after: "id",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in update userId in shots table")
        }

        try {
            await queryInterface.addColumn("shots", "videoFileId", {
                type: DataTypes.INTEGER,
                allowNull: true,
                after: "userId",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in update videoFileId in shots table")
        }

    },
    async down(queryInterface, DataTypes) {
        
    }
};