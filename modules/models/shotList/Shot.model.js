"use strict";
const { Model } = require("sequelize");
const ShotSchema = require("./schema/Shot.schema");

module.exports = (sequelize, DataTypes) => {
    class Shot extends Model {
        static associate(models) {
            models.Shot.belongsToMany(models.Category, { through: models.ShotRelCategory, foreignKey: 'shotId', otherKey: 'categoryId', as: 'category', timestamps: false });
            
            models.Shot.hasMany(models.ShotRelLanguage, { foreignKey: "shotId", as: "languageIds" });
            models.Shot.hasMany(models.ShotRelLanguage, { foreignKey: "shotId", as: "languageIds_0" });
            models.Shot.hasMany(models.ShotRelLanguage, { foreignKey: "shotId", as: "languageIds_1" });
            models.Shot.hasMany(models.ShotRelLanguage, { foreignKey: "shotId", as: "languageIds_2" });
            models.Shot.hasMany(models.ShotRelLanguage, { foreignKey: "shotId", as: "languageIds_3" });
            // models.Shot.belongsToMany(models.Language, { through: models.ShotRelLanguage, foreignKey: 'shotId', otherKey: 'languageId', as: 'languages', timestamps: false });
        
            models.Shot.hasMany(models.ShotRelTag, { foreignKey: "shotId", as: "tagIds" });
            // shot log relation
            models.Shot.hasMany(models.ShotLog, { foreignKey: "shotId", as: "logsId" });

            models.Shot.belongsToMany(models.Tag, { through: models.ShotRelTag, foreignKey: 'shotId', otherKey: 'tagId', as: 'tags', timestamps: false });
        
            // models.Shot.hasMany(models.ShotRelPeopleType, { foreignKey: "shotId", as: "peopleTypeIds" });

            models.Shot.belongsTo(models.VideoFile, { foreignKey: "videoFileId", as: "videoFile" });
            models.Shot.belongsTo(models.User, { foreignKey: "userId", as: "user" });
            models.Shot.belongsTo(models.Project, { foreignKey: "projectId", as: "project" });

            models.Shot.hasMany(models.ShotScore, { foreignKey: "shotId", as: "score" });

            models.Shot.hasMany(models.ExportVideoDetail, { foreignKey: "shotId", as: "export" });
        }
    }

    Shot.equalizedStatus = {
        confirm: 'equalize_confirm', 
        confirm_edit: 'equalize_confirm_edit', 
        need_meeting: 'equalize_need_meeting' 
    }

    Shot.init(
        ShotSchema(DataTypes),
        {
            sequelize,
            tableName: "shots",
            modelName: "Shot",
        }
    );

    return Shot;
};
