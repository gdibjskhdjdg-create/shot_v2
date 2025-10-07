'use strict';

const CreateTable = require("../../_default/migrate");
const ExportVideoFileSchema = require("../../models/videoFile/schema/ExportVideoFile.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('export_video_files', ExportVideoFileSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('export_video_files');
    }
};