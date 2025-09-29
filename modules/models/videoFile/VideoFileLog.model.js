"use strict";
const { Model } = require("sequelize");
const VideoFileLogSchema = require("./schema/VideoFileLog.schema");

module.exports = (sequelize, DataTypes) => {
    class VideoFileLog extends Model {
        static associate(models) {
        }
    }

    VideoFileLog.init(
        VideoFileLogSchema(DataTypes),
        {
            sequelize,
            tableName: "video_file_logs",
            modelName: "VideoFileLog",
        }
    );

    return VideoFileLog;
};
