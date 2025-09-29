'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn('video_detail', 'isAI', {
                type: Sequelize.SMALLINT,
                allowNull: false,
                defaultValue: 0,
            });
        } catch (err) {
            console.log(err);
            errorLog("[-] Error in 73-update-video_detail.migration - rename")
        }

        try {
            await queryInterface.addColumn('video_detail', 'aiTagsId', {
                type: Sequelize.TEXT,
                allowNull: true,
                defaultValue: null
            });
        } catch (err) {
            console.log(err);
            errorLog("[-] Error in 73-update-video_detail.migration - rename")
        }

        try {
            await queryInterface.addColumn('video_detail', 'aiTagStatus', {
                type: Sequelize.STRING(20),
                allowNull: true,
                defaultValue: null
            });
        } catch (err) {
            console.log(err);
            errorLog("[-] Error in 73-update-video_detail.migration - rename")
        }

    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('video_detail', 'isAI');
        await queryInterface.removeColumn('video_detail', 'aiTagsId');
        await queryInterface.removeColumn('video_detail', 'aiTagStatus');
    }
}; 