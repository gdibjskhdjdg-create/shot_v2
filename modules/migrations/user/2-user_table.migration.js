'use strict';

const CreateTable = require("../../_default/migrate");
const UserSchema = require("../../models/user/schema/User.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('users', UserSchema(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    }
};