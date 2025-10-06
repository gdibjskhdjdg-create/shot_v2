"use strict";
const { Model } = require("sequelize");
const CategoriesOfKeywordSchema = require("./schema/CategoryKeyword.schema");

module.exports = (sequelize, DataTypes) => {
    class CategoryKeyword extends Model {
        static associate(models) {
            models.CategoryKeyword.belongsToMany(models.Keyword, {
                through: "keyword_category",
                as: "keywords",
                foreignKey: "categoryId",
                timestamps: false 
            });
        }
    }

    CategoryKeyword.init(
        CategoriesOfKeywordSchema(DataTypes),
        {
            sequelize,
            tableName: "categories_of_keyword",
            modelName: "CategoryKeyword",
        }
    );

    return CategoryKeyword;
};
