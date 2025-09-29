"use strict";
const { Model } = require("sequelize");
const VideoFileSchema = require("./schema/VideoFile.schema");

module.exports = (sequelize, DataTypes) => {
    class VideoFile extends Model {
        static associate(models) {
            models.VideoFile.hasOne(models.VideoDetail, { foreignKey: 'videoFileId', as: 'videoDetail' });
            models.VideoFile.belongsTo(models.Project, { foreignKey: 'projectId', as: "project" });
            models.VideoFile.belongsTo(models.User, { foreignKey: 'userId', as: "user" });
            models.VideoFile.hasMany(models.Shot, { foreignKey: 'videoFileId', as: "shots" });
        }
    }

    VideoFile.init(
        VideoFileSchema(DataTypes),
        {
            sequelize,
            tableName: "video_files",
            modelName: "VideoFile",
        }
    );

    VideoFile.StatusText = (videoFile) => {
        switch (videoFile.status) {
            case 0:
                return "در صف تبدیل";
            case 1:
                return "خطا در گرفتن اطلاعات فایل";
            case 2:
                return "در حال تبدیل";
            case 3:
                return "اتمام تبدیل";
            case 4:
                return "خطا هنگام تبدیل";
            case 5:
                return "دارای سورس";
            case 6:
                return "عدم وجود فایل";
        }
    }

    return VideoFile;
};
