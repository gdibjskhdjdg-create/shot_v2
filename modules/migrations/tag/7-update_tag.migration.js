'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.addColumn("tags", "isCategory", {
                after: "tag",
                type: DataTypes.SMALLINT,
                defaultValue: 0,
            });

            await queryInterface.addColumn("tags", "categoryId", {
                after: "isCategory",
                type: DataTypes.INTEGER,
                defaultValue: null,
                allowNull: true,
                references: {
                    model: "tags",
                    keys: "id",
                },
                onUpdate: "SET NULL",
                onDelete: "SET NULL",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in 7-update_tag.migration")
        }
    },
    async down(queryInterface, DataTypes) {
        try {
            await queryInterface.removeColumn("tags", "isCategory");
            await queryInterface.removeColumn("tags", "categoryId");
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in reverse 7-update_tag.migration")
        }
    }
};