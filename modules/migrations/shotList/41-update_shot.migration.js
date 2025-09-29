'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.removeColumn("shots", "parentId");
            await queryInterface.removeColumn("shots", "type");
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in 41-update_shot.migration")
        }
    },
    async down(queryInterface, DataTypes) {
        try {
            await queryInterface.addColumn("shots", "parentId", {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "shots",
                    keys: "id",
                    as: "parentShot",
                },
                after: "id",
                onUpdate: "SET NULL",
                onDelete: "SET NULL",
            });
            await queryInterface.addColumn("shots", "type", {
                type: DataTypes.STRING, // shot, source
                allowNull: false,
                defaultValue: "shot", 
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in reverse 41-update_shot.migration")
        }
    }
};