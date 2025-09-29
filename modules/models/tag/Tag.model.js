"use strict";
const { Model } = require("sequelize");
const TagSchema = require("./schema/Tag.schema");

module.exports = (sequelize, DataTypes) => {
    class Tag extends Model {
        static associate(models) {
            models.Tag.belongsToMany(models.CategoryTag, {
                through: "tag_category",
                as: "category_tag",
                foreignKey: "tagId",
                timestamps: false
            });

            models.Tag.hasMany(models.TagRelCategory, { foreignKey: "tagId", as: "tag_rel_category" });
            models.Tag.hasMany(models.ShotRelTag, { foreignKey: "tagId", as: "shot_tag" });
        }
    }

    Tag.init(
        TagSchema(DataTypes),
        {
            sequelize,
            tableName: "tags",
            modelName: "Tag",
        }
    );

    return Tag;
};
