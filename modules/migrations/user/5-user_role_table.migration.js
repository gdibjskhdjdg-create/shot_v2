'use strict';

const CreateTable = require("../../_default/migrate");
const UserRoleSchema = require("../../models/user/schema/UserRelRole.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('user_role', UserRoleSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('user_role');
    }
};