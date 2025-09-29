'use strict';

const fs = require('fs');
const Sequelize = require('sequelize');
const path = require('path');

const DBConnection = require('../../../db/DBConnection')
let sequelize = DBConnection.connection(appConfigs.DB);

const db = {};

const mainPath = path.join(__dirname, '..', '..' , "models");

fs.readdirSync(mainPath).forEach(mainFolder => {
    const folderPath = path.join(mainPath, mainFolder);
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath)
            .filter(item => item.includes(".model.js"))
            .forEach(file => {
                const model = require(path.join(folderPath, file))(sequelize, Sequelize.DataTypes);
                db[model.name] = model;
            });
    }
})

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;