'use strict';

const CreateTable = require("../../_default/migrate");
const TagRelCategorySchema = require("../../models/tag/schema/TagRelCategory.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('tag_category', TagRelCategorySchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('tag_category');
    }
};