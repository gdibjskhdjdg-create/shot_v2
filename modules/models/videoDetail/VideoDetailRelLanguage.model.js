"use strict";
const { Model } = require("sequelize");
const VideoDetailRelLanguageSchema = require("./schema/VideoDetailRelLanguages.schema");

module.exports = (sequelize, DataTypes) => {
    class VideoDetailRelLanguage extends Model {
        static associate(models) {
            models.VideoDetailRelLanguage.belongsTo(models.VideoDetail, { foreignKey: "videoFileId", as: "videoDetail" });

        }
    }

    VideoDetailRelLanguage.init(
        VideoDetailRelLanguageSchema(DataTypes),
        {
            sequelize,
            timestamps: false,
            tableName: "video_detail_languages",
            modelName: "VideoDetailRelLanguage",
        }
    );

    return VideoDetailRelLanguage;
};
