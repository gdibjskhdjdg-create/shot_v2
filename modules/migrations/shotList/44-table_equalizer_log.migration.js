'use strict';

const CreateTable = require("../../_default/migrate");
const EqualizerLog = require("../../models/shotList/schema/EqualizerLog.schema");

module.exports = {
    async up(queryInterface, Sequelize) {
        await CreateTable('equalizer_log', EqualizerLog(Sequelize), queryInterface);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('equalizer_log');
    }
};