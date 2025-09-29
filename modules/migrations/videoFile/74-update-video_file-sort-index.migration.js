'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addIndex('video_files', ['id', 'createdAt'], {
                name: 'index-sort',
            });
        } catch (err) {
            console.log(err);
            errorLog("[-] Error in 74-update-video_file-sort-index.migration")
        }
    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeIndex('video_files', 'index-sort');
        }
        catch (err) { }
    }
};