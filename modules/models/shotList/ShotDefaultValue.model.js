"use strict";
const { Model } = require("sequelize");
const ShotDefaultValueSchema = require("./schema/ShotDefaultValues.schema");
const ModelInRedisHook = require("../../_default/model/ModelInRedis.hook");

module.exports = (sequelize, DataTypes) => {
    class ShotDefaultValue extends Model {
        static associate(models) {
        }
    }

    ShotDefaultValue.init(
        ShotDefaultValueSchema(DataTypes),
        {
            sequelize,
            timestamps: false,
            tableName: "shot_default_values",
            modelName: "ShotDefaultValue",
            hooks: ModelInRedisHook.hooks(ShotDefaultValue),
        }
    );
    ShotDefaultValue.storeInRedis = true;

    return ShotDefaultValue;
};
