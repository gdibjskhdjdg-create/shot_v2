"use strict";
const { Model } = require("sequelize");
const RoleSchema = require("./schema/Role.schema");

module.exports = (sequelize, DataTypes) => {
    class Role extends Model {
        
        static associate(models) {
            models.Role.belongsToMany(models.User, {
                through: "user_role",
                as: "user",
                foreignKey: "roleId",
                timestamps: false 
            });
        }
    }

    Role.init(
        RoleSchema(DataTypes),
        {
            sequelize,
            tableName: "roles",
            modelName: "Role",
        }
    );

    return Role;
};
