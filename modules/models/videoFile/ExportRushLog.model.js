"use strict";
const { Model } = require("sequelize");
const ExportRushSchema = require("./schema/ExportRushLog.schema");

module.exports = (sequelize, DataTypes) => {
    class ExportRushLog extends Model {
        static associate(models) {

            models.ExportRushLog.belongsTo(models.ExportVideoFile, { foreignKey: "id", as: "export" });

        }
    }

    ExportRushLog.init(
        ExportRushSchema(DataTypes),
        {
            sequelize,
            tableName: "export_rush_log",
            modelName: "ExportRushLog",
        }
    );

    return ExportRushLog;
};
