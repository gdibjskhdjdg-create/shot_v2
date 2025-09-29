"use strict";
const { Model } = require("sequelize");
const ShotRelCategorySchema = require("./schema/ShotRelCategory.schema");

module.exports = (sequelize, DataTypes) => {
    class ShotRelCategory extends Model {
        static associate(models) {
        }
    }

    ShotRelCategory.init(
        ShotRelCategorySchema(DataTypes),
        {
            sequelize,
            timestamps: false,
            tableName: "shot_category",
            modelName: "ShotRelCategory",
        }
    );

    return ShotRelCategory;
};
