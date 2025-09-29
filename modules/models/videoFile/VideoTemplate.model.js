"use strict";
const { Model } = require("sequelize");
const VideoTemplateSchema = require("./schema/VideoTemplate.schema");

module.exports = (sequelize, DataTypes) => {
    class VideoTemplate extends Model {
        static associate(models) {
        }
    }

    VideoTemplate.init(
        VideoTemplateSchema(DataTypes),
        {
            sequelize,
            tableName: "video_template",
            modelName: "VideoTemplate",
        }
    );

    return VideoTemplate;
};
