"use strict";
const { Model } = require("sequelize");
const TagRelCategorySchema = require("./schema/TagRelCategory.schema")

module.exports = (sequelize, DataTypes) => {
    class TagRelCategory extends Model {
        static associate(models) {
            
        }
    }

    TagRelCategory.init(
        TagRelCategorySchema(DataTypes),
        {
            sequelize,
            timestamps: false,
            tableName: "tag_category",
            modelName: "TagRelCategory",
        }
    );

    return TagRelCategory;
};
