'use strict';

const CreateTable = require("../../_default/migrate");
const Schema = require("../../../modules/models/project/schema/Project.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('projects', Schema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('projects');
    }
};