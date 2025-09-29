require("./configs/index.js");
require("app-module-path").addPath(__dirname);

const DBConnection = require("./db/DBConnection.js");

(async () => {
    DBConnection.connection(appConfigs.DB);
    await DBConnection.ping()

    /* Register listeners */
    require("./init/EventListener.js");
    require("./init/CronJob.js");
})();
