'use strict';

const CreateTable = require("../../_default/migrate");
const TagSchema = require("./schema/Tag.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('tags', TagSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('tags');
    }
};