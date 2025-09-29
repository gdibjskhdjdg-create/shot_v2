'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.removeColumn("shots", "format");
            await queryInterface.removeColumn("shots", "resolution");
            await queryInterface.removeColumn("shots", "frameHeight");
            await queryInterface.removeColumn("shots", "frameWidth");
            await queryInterface.removeColumn("shots", "frameRate");
            await queryInterface.removeColumn("shots", "file");
            await queryInterface.removeColumn("shots", "filePath");
            await queryInterface.removeColumn("shots", "projectId");
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in 40-update_shot.migration")
        }
    },
    async down(queryInterface, DataTypes) {
        try {
            await queryInterface.addColumn("shots", "projectId", {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "projects",
                    keys: "id",
                    as: "Project",
                },
                onUpdate: "SET NULL",
                onDelete: "SET NULL",
            });
            await queryInterface.addColumn("shots", "filePath", {
                type: DataTypes.STRING(1000),
                allowNull: true,
           });
            await queryInterface.addColumn("shots", "file", {
                type: DataTypes.STRING(100),
                allowNull: true,
           });
            await queryInterface.addColumn("shots", "frameRate", {
                type: DataTypes.STRING(20),
                allowNull: true
            });
            await queryInterface.addColumn("shots", "format", {
                type: DataTypes.STRING(10),
                allowNull: true
            });
            await queryInterface.addColumn("shots", "resolution", {
                type: DataTypes.STRING(10),
                allowNull: true
            });
            await queryInterface.addColumn("shots", "frameHeight", {
                type: DataTypes.SMALLINT,
                allowNull: true
            });
            await queryInterface.addColumn("shots", "frameWidth", {
                type: DataTypes.SMALLINT,
                allowNull: true
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in reverse 40-update_shot.migration")
        }
    }
};