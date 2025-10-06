'use strict';

const CreateTable = require("../../_default/migrate");
const KeywordRelCategorySchema = require("../../models/keyword/schema/KeywordRelCategory.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('keyword_category', KeywordRelCategorySchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('keyword_category');
    }
};