const { log } = require("../../../helper/showLog");
const { shotService } = require("../../services/shotList/index");

class Shot_Listener{
    constructor(emitter){
        log("[+] [Listener] Shot");
        // emitter.on('createShotForVideo', ShotService.createShotForVideoFile);
    }
}

module.exports = Shot_Listener;