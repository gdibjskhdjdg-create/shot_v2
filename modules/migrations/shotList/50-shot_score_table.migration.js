'use strict';

const CreateTable = require("../../_default/migrate");
const ShotScoreSchema = require("../../models/shotList/schema/ShotScore.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('shot_score', ShotScoreSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('shot_score');
    }
};