'use strict';

const CreateTable = require("../../_default/migrate");
const ShotSchema = require("../model/schema/Shot.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('shots', ShotSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('shots');
    }
};