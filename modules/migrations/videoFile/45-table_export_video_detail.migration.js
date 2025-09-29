'use strict';

const CreateTable = require("../../_default/migrate");
const ExportVideoDetailSchema = require("../../routes/videoFile/schema/ExportVideoDetail.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('export_video_detail', ExportVideoDetailSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('export_video_detail');
    }
};