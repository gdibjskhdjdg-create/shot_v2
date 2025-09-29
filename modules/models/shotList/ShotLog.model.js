"use strict";
const { Model } = require("sequelize");
const ShotLogSchema = require("./schema/ShotLog.schema.js");

module.exports = (sequelize, DataTypes) => {
    class ShotLog extends Model {
        static associate(models) {
            // shot log relation
            models.ShotLog.belongsTo(models.User, { foreignKey: "userId", as: "user" });
            models.ShotLog.belongsTo(models.Shot, { foreignKey: "shotId", as: "shot" });
        }
    }

    ShotLog.init(
        ShotLogSchema(DataTypes),
        {
            sequelize,
            tableName: "shot_log",
            modelName: "ShotLog",
        }
    );



    return ShotLog;
};
