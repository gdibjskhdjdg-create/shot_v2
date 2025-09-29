'use strict';

const CreateTable = require("../../_default/migrate");
const VideoFileLogSchema = require("../../routes/videoFile/schema/VideoFileLog.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('video_file_logs', VideoFileLogSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('video_file_logs');
    }
};