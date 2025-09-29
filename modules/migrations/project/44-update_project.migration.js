'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.changeColumn("projects", "defaultPath", {
                type: DataTypes.STRING(1000),
                allowNull: true,
            });
            await queryInterface.changeColumn("projects", "title", {
                type: DataTypes.STRING(255),
                allowNull: true,
            });
            await queryInterface.changeColumn("projects", "titleEn", {
                type: DataTypes.STRING(255),
                allowNull: true,
            });
            await queryInterface.changeColumn("projects", "code", {
                type: DataTypes.STRING(255),
                allowNull: true,
            });
            await queryInterface.changeColumn("projects", "producer", {
                type: DataTypes.STRING(255),
                allowNull: true,
            });
            await queryInterface.changeColumn("projects", "director", {
                type: DataTypes.STRING(255),
                allowNull: true,
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in 44-update_project.migration")
        }
    },
    async down(queryInterface, DataTypes) {
    }
};