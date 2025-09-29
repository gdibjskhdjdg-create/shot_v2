require("../../configs");
require("app-module-path").addPath(__dirname);
const DBConnection = require("../../db/DBConnection");

const fs = require('fs');
const { readdir } = require('fs/promises');
const path = require('path');
const Sequelize = require('sequelize');

const { SequelizeMigrations } = require("./model")

async function init(){
    const sequelize = DBConnection.connection();
    const queryInterface = sequelize.getQueryInterface();

    const allFiles = await SequelizeMigrations.findAll();
    const lastMigration = allFiles[allFiles.length - 1];

    if(lastMigration){
        await require(path.join(__dirname, '..', '..', lastMigration.path)).down(queryInterface, Sequelize);
        await lastMigration.destroy();
    }

    process.exit(0)
}

init();