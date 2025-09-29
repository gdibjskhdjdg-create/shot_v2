'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {

            await queryInterface.addColumn("export_video_files", "productId", {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
            });

            await queryInterface.addColumn("export_video_files", "isProduct", {
                type: Sequelize.SMALLINT,
                allowNull: false,
                defaultValue: 0,
                after: "productId",
            });

            await queryInterface.addColumn("export_video_files", "productStatus", {
                type: Sequelize.INTEGER,
                allowNull: true,
                type: Sequelize.ENUM("queue", "pending", 'error', 'complete'),
                after: "isProduct",
            });

            await queryInterface.addColumn("export_video_files", "gifTime", {
                type: Sequelize.TEXT,
                allowNull: true,
                after: "productStatus",
            });


            await queryInterface.addColumn("export_video_files", "textParams", {
                type: Sequelize.TEXT,
                allowNull: true,
                after: "logoParams",
            });

            await queryInterface.changeColumn("export_video_files", "status", {
                type: Sequelize.STRING(20),
                allowNull: false,
                type: Sequelize.ENUM("queue", "pending", 'error', 'complete'),
                defaultValue: 'queue'
            });

            await queryInterface.changeColumn("export_video_detail", "status", {
                type: Sequelize.STRING(20),
                allowNull: false,
                type: Sequelize.ENUM("queue", "pending", 'error', 'complete'),
                defaultValue: 'queue'
            });

            await queryInterface.changeColumn("export_video_files", "isMute", {
                type: Sequelize.SMALLINT,
                allowNull: false,
                defaultValue: 0
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in add  textParams and change status , isMute column in export_video_files table / change status export_video_detail ")
        }

    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("export_video_files", "productId");
        }
        catch (err) { }

        try {
            await queryInterface.removeColumn("export_video_files", "isProduct");
        }
        catch (err) { }

        try {

            await queryInterface.removeColumn("export_video_files", "productStatus");
        }
        catch (err) { }

        try {
            await queryInterface.removeColumn("export_video_files", "gifTime");
        }
        catch (err) { }

        try {
            await queryInterface.removeColumn("export_video_files", "textParams");
        }
        catch (err) { }

    }
};