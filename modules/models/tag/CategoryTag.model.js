"use strict";
const { Model } = require("sequelize");
const CategoriesOfTagSchema = require("./schema/CategoryTag.schema");

module.exports = (sequelize, DataTypes) => {
    class CategoryTag extends Model {
        static associate(models) {
            models.CategoryTag.belongsToMany(models.Tag, {
                through: "tag_category",
                as: "tags",
                foreignKey: "categoryId",
                timestamps: false 
            });
        }
    }

    CategoryTag.init(
        CategoriesOfTagSchema(DataTypes),
        {
            sequelize,
            tableName: "categories_of_tag",
            modelName: "CategoryTag",
        }
    );

    return CategoryTag;
};
