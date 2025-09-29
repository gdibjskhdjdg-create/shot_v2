const path = require("path");
const fs = require("fs");

const { exec, spawn } = require("child_process");
const { generateRandomCode } = require("../../../helper/general.tool");

class FFmpegService {

    takeScreenShot(video, pathToStoreImg = "", times = []) {
        return new Promise((resolve, reject) => {
            let files = [];
            if (!fs.existsSync(video)) {
                return reject("invalidPath");
            }

            let command = "ffmpeg ";
            times.forEach(time => {
                command += ` -ss ${time} -i "${video}"`;
            });
            times.forEach((time, index) => {
                const fileName = `${generateRandomCode(9)}.png`;
                files.push({ fileName, time });

                command += ` -map ${index}:v -vframes 1 "${pathToStoreImg}/${fileName}"`;
            });

            exec(command, async (error, stdout, stderr) => {
                if (error) {
                    return reject(error);
                }

                if (stderr) {
                    return resolve(files);
                }
            })
        })
    }

    FFmpegExecute(command, afterStart = () => {}) {
        let pid = null
        let child = null

        return new Promise(async (resolve, reject) => {
            let ffmpegOptionCommand = {
                detached: false,
                shell: true,
                // cwd: this.fileLocation
            }

            /* Run ffmpeg command */
            const startTime = Date.now()
            let endTime = null
            child = spawn(command, ffmpegOptionCommand);
            pid = child.pid;

            afterStart(pid, startTime)

            console.log('**************************************')
            child.stdout.on('data', (data) => {
                console.log(777777777777, data.toString())
            });

            child.stderr.on('data', (data) => {
                console.log(88888888888, data.toString())
            });

            child.on('error', (err) => {
                endTime = Date.now()
                console.log(9999999999 , err)
                console.log(`[-] Error in process (${pid}):`);
                reject({ pid, startTime, endTime });
            });

            child.on('exit', async (e) => {
                endTime = Date.now()
                console.log(`[+] Exit (${pid})`, e, pid);
                resolve({ pid, startTime, endTime });
            });
        });

    }
}

module.exports = new FFmpegService();