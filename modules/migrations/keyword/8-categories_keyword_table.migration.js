'use strict';

const CreateTable = require("../../_default/migrate");
const CategoriesOfKeywordSchema = require("../../models/keyword/schema/CategoryKeyword.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('categories_of_keyword', CategoriesOfKeywordSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('categories_of_keyword');
    }
};