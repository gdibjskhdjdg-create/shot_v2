'use strict';

const CreateTable = require("../../_default/migrate");
const VideoFileSchema = require("../../routes/videoFile/schema/VideoFile.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('video_files', VideoFileSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('video_files');
    }
};