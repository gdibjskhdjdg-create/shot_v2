"use strict";
const { Model } = require("sequelize");
const CategorySchema = require("./schema/Category.schema");
const ModelInRedisHook = require("../../_default/model/ModelInRedis.hook");

module.exports = (sequelize, DataTypes) => {
    class Category extends Model {
        static associate(models) {
        }
    }

    Category.init(
        CategorySchema(DataTypes),
        {
            sequelize,
            tableName: "categories",
            modelName: "Category",
            hooks: ModelInRedisHook.hooks(Category),
        }
    );
    Category.storeInRedis = true;

    return Category;
};
