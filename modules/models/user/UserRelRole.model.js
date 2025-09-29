"use strict";
const { Model } = require("sequelize");
const UserRelRoleSchema = require("./schema/UserRelRole.schema")

module.exports = (sequelize, DataTypes) => {
    class UserRelRole extends Model {
        static associate(models) {
            
        }
    }

    UserRelRole.init(
        UserRelRoleSchema(DataTypes),
        {
            sequelize,
            timestamps: false,
            tableName: "user_role",
            modelName: "UserRelRole",
        }
    );

    return UserRelRole;
};
