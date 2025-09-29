const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });


// const envData = require("./../init/SetEnvData")
// process.env = {
//     ...process.env, 
//     ...envData,
// }

const DB = require("./db.config");
const REDIS = require("./redis.config");

const URL = process.env.APP_URL
const StoreFolder = process.env.STORE_FOLDER_FROM_APP_ROOT
const StoreUrl = `${URL}/${path.basename(StoreFolder)}`

global.appConfigs = {

    NODE_ENV: process.env.NODE_ENV,
    LANGUAGE: process.env.LANGUAGE,

    APP_HOST: process.env.APP_HOST || "localhost",
    APP_PORT: process.env.APP_PORT || 3070,
    APP_PROTOCOL: process.env.APP_PROTOCOL,
    APP_URL: URL,
    
    WEBAPP_URL: process.env.WEBAPP_URL,

    HTTPS_CERT_FILE: process.env.HTTPS_CERT_FILE,
    HTTPS_KEY_FILE: process.env.HTTPS_KEY_FILE,

    SHOW_LOG: process.env.SHOW_LOG,

    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME,
    VIVIDE_SECRET: process.env.VIVIDE_SECRET,

    BASE_PATH: path.join(__dirname, ".."),

    WATCH_FOLDER_FROM_APP_ROOT: process.env.WATCH_FOLDER_FROM_APP_ROOT,
    WATCH_FOLDER_NOT_TRANSCODE_FROM_APP_ROOT: process.env.WATCH_FOLDER_NOT_TRANSCODE_FROM_APP_ROOT,
    WATCH_FOLDER_AI_FROM_APP_ROOT: process.env.WATCH_FOLDER_AI_FROM_APP_ROOT,
    MainFile_FOLDER_FROM_APP_ROOT: process.env.MainFile_FOLDER_FROM_APP_ROOT,
    STORE_FOLDER_FROM_APP_ROOT: StoreFolder,

    STORE_URL: StoreUrl,

    ENC_KEY: process.env.ENC_KEY,

    DB,
    REDIS,
};
