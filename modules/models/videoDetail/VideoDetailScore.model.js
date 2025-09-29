"use strict";
const { Model } = require("sequelize");
const VideoDetailScoreSchema = require("./schema/VideoDetailScore.schema");

module.exports = (sequelize, DataTypes) => {
    class VideoDetailScore extends Model {
        static associate(models) {

            models.VideoDetailScore.belongsTo(models.User, { foreignKey: "userId", as: "user" });
            models.VideoDetailScore.belongsTo(models.VideoDetail, { foreignKey: "videoFileId", as: "videoDetail" });

        }
    }

    VideoDetailScore.init(
        VideoDetailScoreSchema(DataTypes),
        {
            sequelize,
            timestamps: false,
            tableName: "video_detail_score",
            modelName: "VideoDetailScore",
        }
    );

    return VideoDetailScore;
};
