"use strict";
const { Model } = require("sequelize");
const ShotRelLanguageSchema = require("./schema/ShotRelLanguages.schema");

module.exports = (sequelize, DataTypes) => {
    class ShotRelLanguage extends Model {
        static associate(models) {
        }
    }

    ShotRelLanguage.init(
        ShotRelLanguageSchema(DataTypes),
        {
            sequelize,
            timestamps: false,
            tableName: "shot_languages",
            modelName: "ShotRelLanguage",
        }
    );

    return ShotRelLanguage;
};
