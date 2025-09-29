const { exec } = require("child_process");
const { log, errorLog } = require("../helper/showLog");

module.exports = () => {
    exec(`mediainfo --help`, async (error, stdout, stderr) => {
        if (error) {
            errorLog("[-] mediainfo must be install!");
            return ;
        }
        if (stderr) {
            errorLog("[-] mediainfo must be install!");
            return ;
        }
    })

    exec(`ffmpeg -h`, async (error, stdout, stderr) => {
        if (error) {
            errorLog("[-] ffmpeg must be install!");
            return ;
        }

        if(stdout){
            return ;
        }
        else if (stderr) {
            errorLog("[-] ffmpeg must be install!");
            return ;
        }
    })
}