'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {

            await queryInterface.addColumn("export_video_files", "title", {
                type: Sequelize.STRING(255),
                allowNull: false,
            });

            await queryInterface.addColumn("export_video_files", "userId", {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "users",
                    keys: "id",
                    as: "users",
                },
                onDelete: "SET null",
            });
            await queryInterface.addColumn("export_video_files", "logoParams", {
                type: Sequelize.TEXT,
                allowNull: true,
            });

            await queryInterface.addColumn("export_video_files", "startTime", {
                type: Sequelize.STRING(20),
                allowNull: true,
            });
            await queryInterface.addColumn("export_video_files", "endTime", {
                type: Sequelize.STRING(20),
                allowNull: true,
            });
            await queryInterface.addColumn("export_video_files", "qualityExport", {
                type: Sequelize.INTEGER(5),
                defaultValue: null
            });
            await queryInterface.addColumn("export_video_files", "isMute", {
                type: Sequelize.SMALLINT,
                allowNull: false,
                defaultValue: 0
            });
            await queryInterface.addColumn("export_video_files", "code", {
                type: Sequelize.STRING(255),
                allowNull: false,
            });
            await queryInterface.addColumn("export_video_files", "lastCommand", {
                allowNull: true,
                type: Sequelize.TEXT,
            });
            await queryInterface.addColumn("export_video_files", "pid", {
                allowNull: true,
                type: DataTypes.STRING(20),
            });
            await queryInterface.addColumn("export_video_files", "startTimeLastCommand", {
                type: DataTypes.DATE,
                allowNull: true,
            });
            await queryInterface.addColumn("export_video_files", "endTimeLastCommand", {
                type: DataTypes.DATE,
                allowNull: true,
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in 55-update_export_video_files.migration ")
        }

    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn("export_video_files", "userId");
            await queryInterface.removeColumn("export_video_files", "title");
            await queryInterface.removeColumn("export_video_files", "endTimeLastCommand");
            await queryInterface.removeColumn("export_video_files", "startTimeLastCommand");
            await queryInterface.removeColumn("export_video_files", "pid");
            await queryInterface.removeColumn("export_video_files", "lastCommand");
            await queryInterface.removeColumn("export_video_files", "code");
            await queryInterface.removeColumn("export_video_files", "isMute");
            await queryInterface.removeColumn("export_video_files", "qualityExport");
            await queryInterface.removeColumn("export_video_files", "endTime");
            await queryInterface.removeColumn("export_video_files", "startTime");
            await queryInterface.removeColumn("export_video_files", "logoParams");
        }
        catch (err) { }
    }
};