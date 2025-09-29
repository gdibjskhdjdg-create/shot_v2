/* -------------------------------- Packages -------------------------------- */
require("app-module-path").addPath(__dirname);

/* ---------------------------------- Tools --------------------------------- */
// const { logSqlQuery } = require("../tools/log.tool");

/* ----------- setup environment varialbes to use sequelize-cli ---------- */
require("./../configs");


module.exports = {
    development: {
        username: appConfigs.DB.DB_USERNAME,
        password: appConfigs.DB.DB_PASSWORD,
        database: appConfigs.DB.DB_NAME,
        host: appConfigs.DB.DB_HOST,
        port: appConfigs.DB.DB_PORT,
        dialect: appConfigs.DB.DB_DIALECT,
        dialectOptions: {
            bigNumberStrings: true,
        },
        benchmark: true,
        // logging: logSqlQuery,
    },
    test: {
        username: appConfigs.DB.DB_TEST_USERNAME,
        password: appConfigs.DB.DB_TEST_PASSWORD,
        database: appConfigs.DB.DB_TEST_NAME,
        host: appConfigs.DB.DB_TEST_HOST,
        port: appConfigs.DB.DB_TEST_PORT,
        dialect: appConfigs.DB.DB_TEST_DIALECT,
        dialectOptions: {
            bigNumberStrings: true,
        },
    },
    production: {
        username: appConfigs.DB.DB_PRODUCTION_USERNAME,
        password: appConfigs.DB.DB_PRODUCTION_PASSWORD,
        database: appConfigs.DB.DB_PRODUCTION_NAME,
        host: appConfigs.DB.DB_PRODUCTION_HOST,
        port: appConfigs.DB.DB_PRODUCTION_PORT,
        dialect: appConfigs.DB.DB_PRODUCTION_DIALECT,
        dialectOptions: {
            bigNumberStrings: true,
        },
        benchmark: true,
        // logging: logSqlQuery,
    },
};
