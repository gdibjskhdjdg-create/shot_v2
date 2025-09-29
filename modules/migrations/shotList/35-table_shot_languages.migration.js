'use strict';

const CreateTable = require("../../_default/migrate");
const ShotRelLanguages = require("../model/schema/ShotRelLanguages.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('shot_languages', ShotRelLanguages(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('shot_languages');
    }
};