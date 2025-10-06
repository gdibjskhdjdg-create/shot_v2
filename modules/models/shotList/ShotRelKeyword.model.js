ح"use strict";
const { Model } = require("sequelize");
const ShotRelKeywordSchema = require("./schema/ShotRelKeyword.schema");

module.exports = (sequelize, DataTypes) => {
    class ShotRelKeyword extends Model {
        static associate(models) {
            models.ShotRelKeyword.belongsTo(models.Keyword, { foreignKey: "keywordId", as: "keyword" });
        }
    }

    ShotRelKeyword.init(
        ShotRelKeywordSchema(DataTypes),
        {
            sequelize,
            timestamps: false,
            tableName: "shot_keyword",
            modelName: "ShotRelKeyword",
        }
    );

    return ShotRelKeyword;
};
