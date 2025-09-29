require("./configs/index.js");
require("app-module-path").addPath(__dirname);

const DBConnection = require("./db/DBConnection.js");
const { exportVideoService, rashService } = require("./modules/services/videoFile/index.js");

/* Register listeners */
require("./init/EventListener.js");

/* Time to check the queue again */
let timeId = null;
const RefreshTime = 5000;
(async () => {
    DBConnection.connection(appConfigs.DB);
    await DBConnection.ping()

    console.log('Export service is running.');
    console.log(`Check database every ${RefreshTime} milliseconds`);

    await exportVideoService.setProductStatusFromPending2Queue()
    await run()
})();

async function send2Rush() {
    try {
        // file queue or pending export file
        const file = await exportVideoService.getFirstFile2SendRush()
        if (file) {
            console.log(2222222222, `start sending file to rush with id=${file.id} `)
            // set product status from queue to pending
            await exportVideoService.setFileProduct2Pending(file)
            // send file to rush
            await rashService.GetAndSendDataByExportId(file.id, true)

            console.log(33333333333, `complete sending files to rush with id=${file.id} `)

        }

    } catch (error) {
        console.log('error send to rush', error)
    }
}

async function run() {
    try {
        await send2Rush()
    } catch (error) { }
    refresh()
}

/* This function rerun CheckExistFileToConvert function after "RefreshTime" duration */
async function refresh() {
    if (!!timeId) clearTimeout(timeId)
    timeId = setTimeout(run, RefreshTime);
}