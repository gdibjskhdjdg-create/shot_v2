'use strict';
const Sequelize = require('sequelize');
const DBConnection = require('../../../db/DBConnection')
let sequelize = DBConnection.connection(appConfigs.DB);

const db = {};

const model = require("./migration.model")(sequelize, Sequelize.DataTypes);
db[model.name] = model;

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;