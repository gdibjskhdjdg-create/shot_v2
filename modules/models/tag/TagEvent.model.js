"use strict";
const { Model } = require("sequelize");
const TagEventSchema = require("./schema/TagEvent.schema");

module.exports = (sequelize, DataTypes) => {
    class TagEvent extends Model {
        static associate(models) {
        }
    }

    TagEvent.init(
        TagEventSchema(DataTypes),
        {
            sequelize,
            tableName: "tag_events",
            modelName: "TagEvent",
        }
    );

    return TagEvent;
};
