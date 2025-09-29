"use strict";
const { Model } = require("sequelize");
const ShotInputSchema = require("./schema/ShotInput.schema");
const ModelInRedisHook = require("../../_default/model/ModelInRedis.hook");

module.exports = (sequelize, DataTypes) => {
    class ShotInput extends Model {
        static associate(models) {

        }
    }

    ShotInput.init(
        ShotInputSchema(DataTypes),
        {
            sequelize,
            tableName: "shot_inputs",
            modelName: "ShotInput",
            hooks: ModelInRedisHook.hooks(ShotInput),
        }
    );
    ShotInput.storeInRedis = true;

    return ShotInput;
};
