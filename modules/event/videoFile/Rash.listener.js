const { log } = require("../../../helper/showLog");
const { rashService } = require("../../services/videoFile/index");

class Rash_Listener {
    constructor(emitter) {
        log("[+] [Listener] Rash");
        emitter.on('exportComplete', async (exportId, isProduct) => {
            if (isProduct) {
                try {
                    await rashService.setExportFile2Queue(exportId)
                    // await rashService.GetAndSendDataByExportId(exportId)
                }
                catch (err) { }
            }
        });
    }
}

module.exports = Rash_Listener;
