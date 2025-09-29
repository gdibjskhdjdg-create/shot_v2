"use strict";
const { Model } = require("sequelize");
const ProjectSchema = require("./schema/Project.schema");

module.exports = (sequelize, DataTypes) => {
    class Project extends Model {
        static associate(models) {
            models.Project.hasMany(models.VideoFile, { foreignKey: "projectId", as: "videoFile" });
        }
    }

    Project.init(
        ProjectSchema(DataTypes),
        {
            sequelize,
            paranoid: true,
            tableName: "projects",
            modelName: "Project",
        }
    );

    return Project;
};
