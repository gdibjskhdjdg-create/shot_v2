const path = require("path");
const fs = require("fs");
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { Shot, ShotDefaultValue, ShotRelTag, Tag, sequelize } = require("../../../modules/_default/model");

// last run ==========================================
(async () => {
    try {
        console.log(111111111, 'Clearing all shots picture modes');
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();


        // Clear all picture modes from shot default value
        await ShotDefaultValue.destroy({
            where: { section: ["pictureMode", "pictureType"] },
        });

    } catch (err) {
        console.error('Error occurred:', err); // Log the error for debugging
    } finally {
        process.exit();
    }

})();
