"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class SequelizeMigrations extends Model {
        static associate(models) {
        }
    }

    SequelizeMigrations.init(
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            name: {
                type: DataTypes.STRING(1000),
                allowNull: false,
            },
            path: {
                type: DataTypes.STRING(1000),
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: "sequelize_migrations",
            modelName: "SequelizeMigrations",
        }
    );

    return SequelizeMigrations;
};
