"use strict";
const { Model } = require("sequelize");
const CitySchema = require("./schema/City.schema");

module.exports = (sequelize, DataTypes) => {
    class City extends Model {
        static associate(models) {
        }
    }

    City.init(
        CitySchema(DataTypes),
        {
            sequelize,
            tableName: "city",
            modelName: "City",
        }
    );

    return City;
};
