'use strict';

const CreateTable = require("../../_default/migrate");
const KeywordSchema = require("../../models/keyword/schema/Keyword.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('keywords', KeywordSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('keywords');
    }
};