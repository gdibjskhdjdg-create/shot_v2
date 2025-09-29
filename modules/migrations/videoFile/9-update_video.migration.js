'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, DataTypes) {
        try {
            await queryInterface.addColumn("video_files", "userIdMustBeAssigned", {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "users",
                    keys: "id",
                    as: "userMustBeAssigned",
                },
                onUpdate: "SET NULL",
                onDelete: "SET NULL",
            });
            await queryInterface.addColumn("video_files", "aspectRatio", {
                type: DataTypes.STRING(10),
                allowNull: true
            });
            await queryInterface.removeColumn("video_files", "resolution");
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in migrate 9-update_video.migration")
        }
    },
    async down(queryInterface, DataTypes) {
        try {
            await queryInterface.removeColumn("video_files", "userIdMustBeAssigned");
            await queryInterface.removeColumn("video_files", "aspectRatio");
            await queryInterface.addColumn("video_files", "resolution", {
                type: DataTypes.STRING(10),
                allowNull: true
            });
        }
        catch (err) {
            console.log(err);
            errorLog("[-] Error in reverse 9-update_video.migration")
        }
    }
};