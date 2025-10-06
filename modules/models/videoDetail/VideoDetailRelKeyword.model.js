"use strict";
const { Model } = require("sequelize");
const VideoDetailRelKeywordSchema = require("./schema/VideoDetailRelKeyword.schema");

module.exports = (sequelize, DataTypes) => {
    class VideoDetailRelKeyword extends Model {
        static associate(models) {
            models.VideoDetailRelKeyword.belongsTo(models.Keyword, { foreignKey: "keywordId", as: "keyword" });
        }
    }

    VideoDetailRelKeyword.init(
        VideoDetailRelKeywordSchema(DataTypes),
        {
            sequelize,
            timestamps: false,
            tableName: "video_detail_keyword",
            modelName: "VideoDetailRelKeyword",
        }
    );

    // VideoDetailRelKeyword.removeAttribute('id');

    return VideoDetailRelKeyword;
};
