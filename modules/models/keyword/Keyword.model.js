"use strict";
const { Model } = require("sequelize");
const KeywordSchema = require("./schema/Keyword.schema");

module.exports = (sequelize, DataTypes) => {
    class Keyword extends Model {
        static associate(models) {
            models.Keyword.belongsToMany(models.CategoryKeyword, {
                through: "keyword_category",
                as: "category_keyword",
                foreignKey: "keywordId",
                timestamps: false
            });

            models.Keyword.hasMany(models.KeywordRelCategory, { foreignKey: "keywordId", as: "keyword_rel_category" });
            models.Keyword.hasMany(models.ShotRelKeyword, { foreignKey: "keywordId", as: "shot_keyword" });
        }
    }

    Keyword.init(
        KeywordSchema(DataTypes),
        {
            sequelize,
            tableName: "keywords",
            modelName: "Keyword",
        }
    );

    return Keyword;
};
