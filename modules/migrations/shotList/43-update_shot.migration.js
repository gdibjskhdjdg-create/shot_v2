'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.addColumn("shots", "cityId", {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "city",
                    keys: "id",
                    as: "city",
                },
                onUpdate: "SET NULL",
                onDelete: "SET NULL",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in 43-update_shot.migration - cityId")
        }

        try {
            await queryInterface.addColumn("shots", "projectId", {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "projects",
                    keys: "id",
                    as: "project",
                },
                onUpdate: "SET NULL",
                onDelete: "SET NULL",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in 43-update_shot.migration - projectId")
        }

        try {
            await queryInterface.addColumn("shots", "startDate", {
                type: DataTypes.STRING,
                allowNull: true,
            });
            await queryInterface.addColumn("shots", "endDate", {
                type: DataTypes.STRING,
                allowNull: true,
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in 43-update_shot.migration - startDate-endDate")
        }
    },
    async down(queryInterface, DataTypes) {
        try {
            await queryInterface.removeColumn("shots", "startDate");
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in reverse 43-update_shot.migration - startDate")
        }

        try {
            await queryInterface.removeColumn("shots", "endDate");
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in reverse 43-update_shot.migration - endDate")
        }

        try {
            await queryInterface.removeColumn("shots", "projectId");
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in reverse 43-update_shot.migration - projectId")
        }

        try {
            await queryInterface.removeColumn("shots", "cityId");
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in reverse 43-update_shot.migration - cityId")
        }
    }
};