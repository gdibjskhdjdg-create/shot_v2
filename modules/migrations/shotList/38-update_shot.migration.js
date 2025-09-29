'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.addColumn("shots", "type", {
                type: DataTypes.STRING, // shot, source
                allowNull: false,
                defaultValue: "shot", 
                after: "parentId"
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in update type in shots table")
        }
    },
    async down(queryInterface, DataTypes) {
        try {
            await queryInterface.removeColumn("shots", "type");
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in remove type in shots table")
        }
    }
};