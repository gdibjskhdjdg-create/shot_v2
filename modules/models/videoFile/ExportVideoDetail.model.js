"use strict";
const { Model } = require("sequelize");
const ExportVideoDetailSchema = require("./schema/ExportVideoDetail.schema");

module.exports = (sequelize, DataTypes) => {
    class ExportVideoDetail extends Model {
        static associate(models) {
            models.ExportVideoDetail.belongsTo(models.ExportVideoFile, { foreignKey: "exportId", as: "export" });
        }
    }

    ExportVideoDetail.init(
        ExportVideoDetailSchema(DataTypes),
        {
            sequelize,
            tableName: "export_video_detail",
            modelName: "ExportVideoDetail",
        }
    );

    ExportVideoDetail.StatusText = (ExportVideoDetail) => {
        switch (ExportVideoDetail.status) {
            case 'queue':
                return "در صف تبدیل";
            case 'pending':
                return "در حال تبدیل";
            case 'complete':
                return "اتمام تبدیل";
            case 'error':
                return "خطا هنگام تبدیل";
        }
    }

    return ExportVideoDetail;
};
