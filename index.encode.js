require("./configs/index.js");
require("app-module-path").addPath(__dirname);

const DBConnection = require("./db/DBConnection.js");

const cron = require('node-cron');
const { videoFileService } = require('./modules/services/videoFile/index');
const { logError } = require('./helper/log.tool.js');

(async () => {
    DBConnection.connection(appConfigs.DB);
    await DBConnection.ping()

    videoFileService.restartEncode();
    videoFileService.checkAndStartEncode();

    cron.schedule('*/1 * * * *', async () => {
        try{
            videoFileService.checkAndStartEncode();
        }
        catch(err){
            logError("encode", err, "encode")
        }
    });
})();
