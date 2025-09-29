"use strict";
const { Model } = require("sequelize");
const EqualizerLogSchema = require("./schema/EqualizerLog.schema");

module.exports = (sequelize, DataTypes) => {
    class EqualizerLog extends Model {
        static associate(models) {
            models.EqualizerLog.belongsTo(models.User, { foreignKey: "userId", as: "user" });
            models.EqualizerLog.hasOne(models.Shot, { foreignKey: "lastEqualizeLogId", as: "shot" });
        }
    }

    EqualizerLog.init(  
        EqualizerLogSchema(DataTypes),
        {
            sequelize,
            tableName: "equalizer_log",
            modelName: "EqualizerLog",
        }
    );

    return EqualizerLog;
};
