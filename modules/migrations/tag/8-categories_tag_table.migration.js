'use strict';

const CreateTable = require("../../_default/migrate");
const CategoriesOfTagSchema = require("../../models/tag/schema/CategoryTag.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('categories_of_tag', CategoriesOfTagSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('categories_of_tag');
    }
};