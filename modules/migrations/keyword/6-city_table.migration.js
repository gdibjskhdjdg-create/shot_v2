'use strict';

const CreateTable = require("../../_default/migrate");
const CitySchema = require("../../models/tag/schema/City.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('city', CitySchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('city');
    }
};