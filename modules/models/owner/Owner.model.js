"use strict";
const { Model } = require("sequelize");
const OwnerSchema = require("./schema/Owner.schema");
const ModelInRedisHook = require("../../_default/model/ModelInRedis.hook");

module.exports = (sequelize, DataTypes) => {
    class Owner extends Model {
        static associate(models) {
        }
    }

    Owner.init(
        OwnerSchema(DataTypes),
        {
            sequelize,
            tableName: "owners",
            modelName: "Owner",
            hooks: ModelInRedisHook.hooks(Owner),
        }
    );
    Owner.storeInRedis = true;

    return Owner;
};
