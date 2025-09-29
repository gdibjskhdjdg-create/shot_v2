'use strict';

const CreateTable = require("../../_default/migrate");
const LanguageSchema = require("../../models/language/schema/Language.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('languages', LanguageSchema(Sequelize), queryInterface)
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('languages');
    }
};