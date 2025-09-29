'use strict';

const CreateTable = require("../../_default/migrate");
const ExportRushLogSchema = require("../../routes/videoFile/schema/ExportRushLog.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('export_rush_log', ExportRushLogSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('export_rush_log');
    }
};