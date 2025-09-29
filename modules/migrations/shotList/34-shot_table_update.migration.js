'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.renameColumn('shots', 'ageGroup', 'ageRangeDefaultValueId');
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in change name ageGroup in shot table")
        }

        try {
            await queryInterface.changeColumn("shots", "ageRangeDefaultValueId", {
                type: Sequelize.INTEGER,
                allowNull: true,
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in update ageRangeDefaultValueId in shots table")
        }
    },
    async down(queryInterface, Sequelize) {

    }
};