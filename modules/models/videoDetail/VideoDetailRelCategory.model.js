"use strict";
const { Model } = require("sequelize");
const VideoDetailRelCategorySchema = require("./schema/VideoDetailRelCategory.schema");

module.exports = (sequelize, DataTypes) => {
    class VideoDetailRelCategory extends Model {
        static associate(models) {
            models.VideoDetailRelCategory.belongsTo(models.VideoDetail, { foreignKey: "videoFileId", as: "videoDetail" });

        }
    }

    VideoDetailRelCategory.init(
        VideoDetailRelCategorySchema(DataTypes),
        {
            sequelize,
            timestamps: false,
            tableName: "video_detail_category",
            modelName: "VideoDetailRelCategory",
        }
    );

    return VideoDetailRelCategory;
};
