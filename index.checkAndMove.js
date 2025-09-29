require("./configs/index.js");
require("app-module-path").addPath(__dirname);

const DBConnection = require("./db/DBConnection.js");

const cron = require('node-cron');
const { configLog } = require('./helper/showLog');
const { videoFileService } = require('./modules/services/videoFile/index');
const WatchFolderVideoFileService = require('./modules/services/videoFile/WatchFolderVideoFile.service');
const { logError } = require('./helper/log.tool');

(async () => {
    DBConnection.connection(appConfigs.DB);
    await DBConnection.ping()

    let isCheckFile = false;
//    try{
//        await WatchFolderVideoFileService.checkNewFile();
//       await WatchFolderVideoFileService.checkAndRemoveFolders();
//    }
//    catch(err){
//        logError("remove_folder", err, "move_files")
//    }
    
    cron.schedule('*/1 * * * *', async () => {
        console.log(1111, "check And Move")
        if(isCheckFile) return;
        try{
            isCheckFile = true;
            await WatchFolderVideoFileService.checkNewFile();
        }
        catch(err){
            logError("watchFolder", err, "move_files")
        }

        isCheckFile = false;
        console.log(22222, "check And Move Complete")
    });

    cron.schedule('1 * * * *', async () => {
        try{
            await WatchFolderVideoFileService.checkAndRemoveFolders();
        }
        catch(err){
            logError("remove_folder", err, "move_files")
        }
    });
})();
