'use strict';

const CreateTable = require("../../_default/migrate");
const VideoDetailRelCategorySchema = require("../../models/videoDetail/schema/VideoDetailRelCategory.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('video_detail_category', VideoDetailRelCategorySchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('video_detail_category');
    }
};