'use strict';

const CreateTable = require("../../_default/migrate");
const OwnerSchema = require("../../models/owner/schema/Owner.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('owners', OwnerSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('owners');
    }
};