'use strict';

const CreateTable = require("../../_default/migrate");
const ShotRelKeywordSchema = require("../model/schema/ShotRelKeyword.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('shot_keyword', ShotRelKeywordSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('shot_keyword');
    }
};