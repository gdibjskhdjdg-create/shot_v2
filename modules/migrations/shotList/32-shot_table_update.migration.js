'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.changeColumn("shots", "frameRate", {
                type: Sequelize.STRING(20),
                allowNull: true,
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in update frameRate in shots table")
        }

    },
    async down(queryInterface, Sequelize) {
        
    }
};