"use strict";
const { Model } = require("sequelize");
const KeywordRelCategorySchema = require("./schema/KeywordRelCategory.schema")

module.exports = (sequelize, DataTypes) => {
    class KeywordRelCategory extends Model {
        static associate(models) {
            
        }
    }

    KeywordRelCategory.init(
        KeywordRelCategorySchema(DataTypes),
        {
            sequelize,
            timestamps: false,
            tableName: "keyword_category",
            modelName: "KeywordRelCategory",
        }
    );

    return KeywordRelCategory;
};
