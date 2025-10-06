'use strict';

const CreateTable = require("../../_default/migrate");
const KeywordLocationSchema = require("../../models/keyword/schema/KeywordLocation.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('keyword_locations', KeywordLocationSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('keyword_locations');
    }
};