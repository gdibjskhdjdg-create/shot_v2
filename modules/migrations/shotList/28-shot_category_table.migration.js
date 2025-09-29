'use strict';

const CreateTable = require("../../_default/migrate");
const ShotRelCategorySchema = require("../model/schema/ShotRelCategory.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('shot_category', ShotRelCategorySchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('shot_category');
    }
};