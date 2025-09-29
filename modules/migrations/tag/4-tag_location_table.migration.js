'use strict';

const CreateTable = require("../../_default/migrate");
const TagLocationSchema = require("../../models/tag/schema/TagLocation.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('tag_locations', TagLocationSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('tag_locations');
    }
};