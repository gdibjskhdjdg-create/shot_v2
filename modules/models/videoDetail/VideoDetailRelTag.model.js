"use strict";
const { Model } = require("sequelize");
const VideoDetailRelTagSchema = require("./schema/VideoDetailRelTag.schema");

module.exports = (sequelize, DataTypes) => {
    class VideoDetailRelTag extends Model {
        static associate(models) {
            models.VideoDetailRelTag.belongsTo(models.Tag, { foreignKey: "tagId", as: "tag" });
        }
    }

    VideoDetailRelTag.init(
        VideoDetailRelTagSchema(DataTypes),
        {
            sequelize,
            timestamps: false,
            tableName: "video_detail_tag",
            modelName: "VideoDetailRelTag",
        }
    );

    // VideoDetailRelTag.removeAttribute('id');

    return VideoDetailRelTag;
};
