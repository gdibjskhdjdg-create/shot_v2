'use strict';

const CreateTable = require("../../_default/migrate");
const ShotDefaultValues = require("../../models/shotList/schema/ShotDefaultValues.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('shot_default_values', ShotDefaultValues(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('shot_default_values');
    }
};