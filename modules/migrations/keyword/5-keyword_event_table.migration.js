'use strict';

const CreateTable = require("../../_default/migrate");
const KeywordEventSchema = require("../../models/keyword/schema/KeywordEvent.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('keyword_events', KeywordEventSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('keyword_events');
    }
};