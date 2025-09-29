'use strict';

const CreateTable = require("../../_default/migrate");
const VideoTemplateSchema = require("../../routes/videoFile/schema/VideoTemplate.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('video_template', VideoTemplateSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('video_template');
    }
};