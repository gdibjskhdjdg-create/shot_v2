"use strict";
const { Model } = require("sequelize");
const VideoDetailLogSchema = require("./schema/VideoDetailLog.schema.js");

module.exports = (sequelize, DataTypes) => {
    class VideoDetailLog extends Model {
        static associate(models) {
            // shot log relation
            models.VideoDetailLog.belongsTo(models.User, { foreignKey: "userId", as: "user" });
            models.VideoDetailLog.belongsTo(models.VideoDetail, { foreignKey: "videoFileId", as: "videoDetail" });
        }
    }

    VideoDetailLog.init(
        VideoDetailLogSchema(DataTypes),
        {
            sequelize,
            tableName: "video_detail_log",
            modelName: "VideoDetailLog",
        }
    );



    return VideoDetailLog;
};
