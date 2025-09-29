'use strict';

const CreateTable = require("../../_default/migrate");
const RoleSchema = require("../../models/user/schema/Role.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('roles', RoleSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('roles');
    }
};