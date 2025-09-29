'use strict';

const CreateTable = require("../../_default/migrate");
const VideoDetailLogSchema = require("../../models/videoDetail/schema/VideoDetailLog.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('video_detail_log', VideoDetailLogSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('video_detail_log');
    }
};