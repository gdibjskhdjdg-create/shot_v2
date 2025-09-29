"use strict";
const { Model } = require("sequelize");
const UserSchema = require("./schema/User.schema");

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        
        static associate(models) {

            models.User.belongsToMany(models.Role, {
                through: "user_role",
                as: "role",
                foreignKey: "userId",
                timestamps: false 
            });
        }
    }

    User.init(UserSchema(DataTypes),
        {
            sequelize,
            paranoid: true,
            tableName: "users",
            modelName: "User",
        }
    );

    return User;
};
