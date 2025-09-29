'use strict';

const CreateTable = require("../../_default/migrate");
const ShotInputSchema = require("../model/schema/ShotInput.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('shot_inputs', ShotInputSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('shot_inputs');
    }
};