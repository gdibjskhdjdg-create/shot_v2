'use strict';

const CreateTable = require("../../_default/migrate");
const VideoDetailRelLanguageSchema = require("../../models/videoDetail/schema/VideoDetailRelLanguages.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('video_detail_languages', VideoDetailRelLanguageSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('video_detail_languages');
    }
};