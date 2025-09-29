require("./configs/index.js");
require("app-module-path").addPath(__dirname);

const DBConnection = require("./db/DBConnection.js");
const { exportVideoService } = require("./modules/services/videoFile/index.js");
const kill = require('tree-kill');

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

    await clearPreviousPendingProcess()
    await run()
})();

async function clearPreviousPendingProcess() {
    try {
        const firstFilePending = await exportVideoService.getFirstExportByStatus('pending', false)
        if (firstFilePending) {

            kill(+firstFilePending.pid)

            firstFilePending.pid = null
            firstFilePending.status = 'queue'
            await firstFilePending.save()
        }
    } catch (error) {
        console.log('clear previous pending error', error)
    }
}

async function run() {
    try {
        await exportVideoService.CheckExistFileToExport()
    } catch (error) {}
    refresh()
}

/* This function rerun CheckExistFileToConvert function after "RefreshTime" duration */
async function refresh() {
    if (!!timeId) clearTimeout(timeId)
    timeId = setTimeout(run, RefreshTime);
}
