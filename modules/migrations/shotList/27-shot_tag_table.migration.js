'use strict';

const CreateTable = require("../../_default/migrate");
const ShotRelTagSchema = require("../../models/shotList/schema/ShotRelTag.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('shot_tag', ShotRelTagSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('shot_tag');
    }
};