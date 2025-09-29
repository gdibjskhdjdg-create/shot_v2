"use strict";
const { Model } = require("sequelize");
const LanguageSchema = require("./schema/Language.schema");
const ModelInRedisHook = require("../../_default/model/ModelInRedis.hook");

module.exports = (sequelize, DataTypes) => {
    class Language extends Model {
        static associate(models) {
        }
    }

    Language.init(
        LanguageSchema(DataTypes),
        {
            sequelize,
            tableName: "languages",
            modelName: "Language",
            hooks: ModelInRedisHook.hooks(Language),
        }
    );

    Language.storeInRedis = true;

    return Language;
};
