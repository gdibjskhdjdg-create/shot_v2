"use strict";
const { Model } = require("sequelize");
const TagLocationSchema = require("./schema/TagLocation.schema");

module.exports = (sequelize, DataTypes) => {
    class TagLocation extends Model {
        static associate(models) {
        }
    }

    TagLocation.init(
        TagLocationSchema(DataTypes),
        {
            sequelize,
            tableName: "tag_locations",
            modelName: "TagLocation",
        }
    );

    return TagLocation;
};
