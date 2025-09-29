'use strict';

const CreateTable = require("../../_default/migrate");
const TagEventSchema = require("../../models/tag/schema/TagEvent.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('tag_events', TagEventSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('tag_events');
    }
};