'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.addColumn("shots", "parentId", {
                type: DataTypes.INTEGER,
                allowNull: true,
                after: "id",
                references: {
                    model: "shots",
                    keys: "id",
                    as: "parentShot",
                },
                onUpdate: "SET NULL",
                onDelete: "SET NULL",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in update parentId in shots table")
        }
    },
    async down(queryInterface, DataTypes) {
        try {
            await queryInterface.removeColumn("shots", "parentId");
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in remove parentId in shots table")
        }
    }
};