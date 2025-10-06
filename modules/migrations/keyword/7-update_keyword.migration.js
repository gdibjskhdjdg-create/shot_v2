'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.addColumn("keywords", "isCategory", {
                after: "keyword",
                type: DataTypes.SMALLINT,
                defaultValue: 0,
            });

            await queryInterface.addColumn("keywords", "categoryId", {
                after: "isCategory",
                type: DataTypes.INTEGER,
                defaultValue: null,
                allowNull: true,
                references: {
                    model: "keywords",
                    keys: "id",
                },
                onUpdate: "SET NULL",
                onDelete: "SET NULL",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in 7-update_keyword.migration")
        }
    },
    async down(queryInterface, DataTypes) {
        try {
            await queryInterface.removeColumn("keywords", "isCategory");
            await queryInterface.removeColumn("keywords", "categoryId");
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in reverse 7-update_keyword.migration")
        }
    }
};