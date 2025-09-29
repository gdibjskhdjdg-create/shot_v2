'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.removeIndex('tags', 'tag');
        } catch (err) {
            console.log(err);
            errorLog("[-] Error in 12-update-tag-UUID.migration")
        }
    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.addIndex('tags', {
                fields: ['tag'],
                name: 'tag',
                unique: true
              });
        }
        catch (err) { }
    }
};