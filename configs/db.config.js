
module.exports = dbConfig = {
    dbType: 'postgres',

    /* ------------------------------- development ------------------------------ */
    db: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,

    /* ---------------------------------- test ---------------------------------- */
    db_test: process.env.DB_TEST_NAME,
    username_test: process.env.DB_TEST_USERNAME,
    password_test: process.env.DB_TEST_PASSWORD,
    host_test: process.env.DB_TEST_HOST,
    port_test: process.env.DB_TEST_PORT,
    dialect_test: process.env.DB_TEST_DIALECT,

    /* ------------------------------- production ------------------------------- */
    db_production: process.env.DB_PRODUCTION_NAME,
    username_production: process.env.DB_PRODUCTION_USERNAME,
    password_production: process.env.DB_PRODUCTION_PASSWORD,
    host_production: process.env.DB_PRODUCTION_HOST,
    port_production: process.env.DB_PRODUCTION_PORT,
    dialect_production: process.env.DB_PRODUCTION_DIALECT,
};