"use strict";
const { Model } = require("sequelize");
const ShotScoreSchema = require("./schema/ShotScore.schema");

module.exports = (sequelize, DataTypes) => {
    class ShotScore extends Model {
        static associate(models) {
            models.ShotScore.belongsTo(models.User, { foreignKey: "userId", as: "user" });
            models.ShotScore.belongsTo(models.Shot, { foreignKey: "shotId", as: "shot" });
        }
    }

    ShotScore.init(
        ShotScoreSchema(DataTypes),
        {
            sequelize,
            timestamps: false,
            tableName: "shot_score",
            modelName: "ShotScore",
        }
    );

    return ShotScore;
};
