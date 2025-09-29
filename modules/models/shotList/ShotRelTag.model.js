"use strict";
const { Model } = require("sequelize");
const ShotRelTagSchema = require("./schema/ShotRelTag.schema");

module.exports = (sequelize, DataTypes) => {
    class ShotRelTag extends Model {
        static associate(models) {
            models.ShotRelTag.belongsTo(models.Tag, { foreignKey: "tagId", as: "tag" });
        }
    }

    ShotRelTag.init(
        ShotRelTagSchema(DataTypes),
        {
            sequelize,
            timestamps: false,
            tableName: "shot_tag",
            modelName: "ShotRelTag",
        }
    );

    return ShotRelTag;
};
