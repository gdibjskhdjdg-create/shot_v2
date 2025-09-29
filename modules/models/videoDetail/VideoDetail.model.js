"use strict";
const { Model } = require("sequelize");
const VideoDetailSchema = require("./schema/VideoDetail.schema");

module.exports = (sequelize, DataTypes) => {
    class VideoDetail extends Model {
        static associate(models) {
            models.VideoDetail.belongsToMany(models.Category, { through: models.VideoDetailRelCategory, foreignKey: 'videoFileId', otherKey: 'categoryId', as: 'category', timestamps: false });

            models.VideoDetail.hasMany(models.VideoDetailRelLanguage, { foreignKey: "videoFileId", as: "languageIds" });
            models.VideoDetail.hasMany(models.VideoDetailRelLanguage, { foreignKey: "videoFileId", as: "languageIds_0" });
            models.VideoDetail.hasMany(models.VideoDetailRelLanguage, { foreignKey: "videoFileId", as: "languageIds_1" });
            models.VideoDetail.hasMany(models.VideoDetailRelLanguage, { foreignKey: "videoFileId", as: "languageIds_2" });
            models.VideoDetail.hasMany(models.VideoDetailRelLanguage, { foreignKey: "videoFileId", as: "languageIds_3" });
            // models.VideoDetail.belongsToMany(models.Language, { through: models.VideoDetailRelLanguage, foreignKey: 'videoFileId', otherKey: 'languageId', as: 'languages', timestamps: false });

            models.VideoDetail.hasMany(models.VideoDetailRelTag, { foreignKey: "videoFileId", as: "tagIds" });
            models.VideoDetail.belongsToMany(models.Tag, { through: models.VideoDetailRelTag, foreignKey: 'videoFileId', otherKey: 'tagId', as: 'tags', timestamps: false });
            
            models.VideoDetail.hasMany(models.VideoDetailLog, { foreignKey: "videoFileId", as: "logsId" });

            // models.VideoDetail.hasMany(models.VideoDetailRelPeopleType, { foreignKey: "videoFileId", as: "peopleTypeIds" });

            models.VideoDetail.belongsTo(models.VideoFile, { foreignKey: 'videoFileId', as: 'videoFile' });

            models.VideoDetail.belongsTo(models.User, { foreignKey: "userId", as: "user" });
            models.VideoDetail.belongsTo(models.Project, { foreignKey: "projectId", as: "project" });
            models.VideoDetail.hasMany(models.Shot, { foreignKey: "videoFileId", as: "shots" });

            models.VideoDetail.hasMany(models.VideoDetailScore, { foreignKey: "videoFileId", as: "score" })
        }
        
    }

    VideoDetail.init(
        VideoDetailSchema(DataTypes),
        {
            sequelize,
            tableName: "video_detail",
            modelName: "VideoDetail",
        }
    );

    return VideoDetail;
};
