'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.removeIndex('keywords', 'keyword');
        } catch (err) {
            console.log(err);
            errorLog("[-] Error in 12-update-keyword-UUID.migration")
        }
    },
    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.addIndex('keywords', {
                fields: ['keyword'],
                name: 'keyword',
                unique: true
              });
        }
        catch (err) { }
    }
};