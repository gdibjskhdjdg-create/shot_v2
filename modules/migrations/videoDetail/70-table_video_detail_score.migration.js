'use strict';

const CreateTable = require("../../_default/migrate");
const VideoDetailScoreSchema = require("../../models/videoDetail/schema/VideoDetailScore.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('video_detail_score', VideoDetailScoreSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('video_detail_score');
    }
};