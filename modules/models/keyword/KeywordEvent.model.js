"use strict";
const { Model } = require("sequelize");
const KeywordEventSchema = require("./schema/KeywordEvent.schema");

module.exports = (sequelize, DataTypes) => {
    class KeywordEvent extends Model {
        static associate(models) {
        }
    }

    KeywordEvent.init(
        KeywordEventSchema(DataTypes),
        {
            sequelize,
            tableName: "keyword_events",
            modelName: "KeywordEvent",
        }
    );

    return KeywordEvent;
};
