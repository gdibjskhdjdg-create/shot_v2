'use strict';

const CreateTable = require("../../_default/migrate");
const CategorySchema = require("../../../modules/models/category/schema/Category.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('categories', CategorySchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('categories');
    }
};