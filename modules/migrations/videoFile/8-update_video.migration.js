'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.addColumn("video_files", "projectId", {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "projects",
                    keys: "id",
                    as: "Project",
                },
                onUpdate: "SET NULL",
                onDelete: "SET NULL",
                after: "id",
            });
            await queryInterface.addColumn("video_files", "frameRate", {
                type: DataTypes.STRING(20),
                allowNull: true,
                after: "duration",
            });
            await queryInterface.addColumn("video_files", "resolution", {
                type: DataTypes.STRING(10),
                allowNull: true,
                after: "frameRate",
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in migrate 3-update_video.migration")
        }
    },
    async down(queryInterface, DataTypes) {
        try {
            await queryInterface.removeColumn("video_files", "resolution");
            await queryInterface.removeColumn("video_files", "frameRate");
            await queryInterface.removeColumn("video_files", "projectId");
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in reverse 3-update_video.migration")
        }
    }
};