'use strict';

const CreateTable = require("../../_default/migrate");
const ShotLogSchema = require("../../models/shotList/schema/ShotLog.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('shot_log', ShotLogSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('shot_log');
    }
};