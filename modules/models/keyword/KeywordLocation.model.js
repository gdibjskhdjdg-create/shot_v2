"use strict";
const { Model } = require("sequelize");
const KeywordLocationSchema = require("./schema/KeywordLocation.schema");

module.exports = (sequelize, DataTypes) => {
    class KeywordLocation extends Model {
        static associate(models) {
        }
    }

    KeywordLocation.init(
        KeywordLocationSchema(DataTypes),
        {
            sequelize,
            tableName: "keyword_locations",
            modelName: "KeywordLocation",
        }
    );

    return KeywordLocation;
};
