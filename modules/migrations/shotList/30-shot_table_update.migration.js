'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn("shots", "format", {
                type: Sequelize.STRING(10),
                allowNull: true,
                after: "resolution",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in create format in shots table")
        }

        try {
            await queryInterface.changeColumn("shots", "resolution", {
                type: Sequelize.STRING(10),
                allowNull: true,
            });
            await queryInterface.changeColumn("shots", "soundQuality", {
                type: Sequelize.STRING(10),
                allowNull: true,
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in update resolution in shots table")
        }

    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("shots", "format");
        }
        catch (err) { }
    }
};