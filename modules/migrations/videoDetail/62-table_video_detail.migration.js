'use strict';

const CreateTable = require("../../_default/migrate");
const VideoDetailSchema = require("../../models/videoDetail/schema/VideoDetail.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('video_detail', VideoDetailSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('video_detail');
    }
};