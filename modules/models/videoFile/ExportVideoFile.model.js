"use strict";
const { Model } = require("sequelize");
const ExportVideoFileSchema = require("./schema/ExportVideoFile.schema");

module.exports = (sequelize, DataTypes) => {
    class ExportVideoFile extends Model {
        static associate(models) {
            models.ExportVideoFile.hasMany(models.ExportVideoDetail, { as: 'detail', foreignKey: 'exportId' });
            models.ExportVideoFile.hasMany(models.ExportRushLog, { as: 'rushLog', foreignKey: 'exportId' });
        }
    }

    ExportVideoFile.init(
        ExportVideoFileSchema(DataTypes),
        {
            sequelize,
            paranoid: true,
            tableName: "export_video_files",
            modelName: "ExportVideoFile",
        }
    );

    ExportVideoFile.StatusText = (ExportVideoFile) => {
        switch (ExportVideoFile.status) {
            case 0:
                return "در صف تبدیل";
            case 1:
                return "در حال تبدیل";
            case 2:
                return "اتمام تبدیل";
            case 3:
                return "خطا هنگام تبدیل";
        }
    }

    return ExportVideoFile;
};
