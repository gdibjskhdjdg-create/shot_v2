'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.removeIndex('categories', 'name');
        } catch (err) {
            console.log(err);
            errorLog("[-] Error in 13-update-categories-UUID.migration")
        }
    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.addIndex('categories', {
                fields: ['name'],
                name: 'name',
                unique: true
              });
        }
        catch (err) { }
    }
};