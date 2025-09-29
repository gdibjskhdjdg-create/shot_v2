'use strict';

const CreateTable = require("../../_default/migrate");
const VideoDetailTagSchema = require("../../models/videoDetail/schema/VideoDetailRelTag.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('video_detail_tag', VideoDetailTagSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('video_detail_tag');
    }
};