require("./configs/index.js");
require("app-module-path").addPath(__dirname);
const fs = require('fs');

const DBConnection = require("./db/DBConnection.js");
// const { exportVideoService } = require("./modules/services/videoFile/index.js");
const kill = require('tree-kill');

/* Register listeners */
require("./init/EventListener.js");
const { exec, spawn } = require("child_process");
const path = require("path");
const { videoDetailService } = require("./modules/services/videoDetail/index.js");

/* Time to check the queue again */
let timeId = null;
const RefreshTime = 5000;

(async () => {
    DBConnection.connection(appConfigs.DB);
    await DBConnection.ping()

    console.log('Get ai tags service is running.');
    console.log(`Check database every ${RefreshTime} milliseconds`);

    await clearPreviousPendingProcess()
    await run()
})();

async function clearPreviousPendingProcess() {
    try {
        const firstPending = await videoDetailService.checkFirstPendingForAI(false)
        if (firstPending) {
            await videoDetailService.updateAITagStatus(firstPending.videoFileId, 'queue')
        }
    } catch (error) {
        console.log('clear previous pending error', error)
    }
}

async function run() {

    const detail = await videoDetailService.checkFirstQueueForAI()
    let detailId = detail?.videoFileId;

    try {
        if (detailId) {
            const video = detail.videoFile.toJSON();
            console.log('Fetching AI tags for:', detailId);

            const videoPath = path.join(video.path, video.name);
            console.log('Video path:', videoPath);

            if (!fs.existsSync(videoPath)) {
                console.log('Video path does not exist:', videoPath);
                await videoDetailService.updateAITagStatus(detailId, 'error');
                refresh()
                return;
            }

            const response = await executeTagAIScript(detailId, detail.title.split(".")[0], videoPath);
            const { outputPath } = response;

            console.log('Storing tags in:', outputPath);
            await storeTagsOfScript(detailId, outputPath);
            await videoDetailService.updateAITagStatus(detailId, 'complete');
            detailId = null

            console.log('Store tags completed');
        }
    } catch (error) {
        if (detailId) {
            console.error(4444444444444, 'Error in run function:', error);
            await videoDetailService.updateAITagStatus(detailId, 'error');
        }
    }
    refresh()
}

function refresh() {
    if (timeId) clearTimeout(timeId);
    timeId = setTimeout(run, RefreshTime);
}

async function executeTagAIScript(detailId, title, videoPath, afterStart = () => { }) {
    return new Promise(async (resolve, reject) => {
        const mainScriptFile = path.join(process.env.AI_TAG_PYTHON_SCRIPT_PATH);
        const dir = path.join(process.env.AI_TAGS_JSON_OUTPUT || path.dir(videoPath))
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        const outputPath = path.join(dir, `${title}.json`);

        const isWindows = process.platform === 'win32';
        const pythonArgs = [mainScriptFile, '--input', `"${videoPath}"`, '--output', `"${outputPath}"`];

        const [command, args] = isWindows
            ? ['cmd', ['/c', 'chcp 65001>nul && python', ...pythonArgs]]
            : ['python3', pythonArgs];
        // : ['/var/www/ai.sh'];

        console.log('Executing:', command, pythonArgs.join(' '), args);
        if (timeId) clearTimeout(timeId);


        // const child = spawn(command, args, {
        const child = spawn(
            'python3',
            [
                '/var/www/Video_Tagging/main.py',
                '--input',
                videoPath,
                '--output',
                outputPath
            ],
            {
                encoding: 'utf-8',
                shell: false,
                // cwd: process.cwd(),
                env: {
                    // ...process.env,
                    PYTHONIOENCODING: 'utf-8',
                    PYTHONUTF8: '1',
                    ...(isWindows ? {
                        NODE_CHCP: '65001',
                        CHCP: '65001'
                    } : {
                        LC_ALL: 'en_US.UTF-8',
                        LANG: 'en_US.UTF-8'
                    })
                }
            });

        // Set UTF-8 encoding for streams
        child.stdout.setEncoding('utf-8');
        child.stderr.setEncoding('utf-8');

        const startTime = Date.now();
        let endTime = null;
        let stderrData = '';
        let stdoutData = '';
        let resolved = false;

        afterStart(child.pid, startTime);
        await videoDetailService.updateAITagStatus(detailId, 'pending');

        child.stdout.on('data', (data) => {
            console.log(111111111111111, data);
            stdoutData += data;
            console.log('Python stdout:', data);
        });

        child.stderr.on('data', (data) => {
            console.log(22222222222, data);
            stderrData += data;
            console.error('Python stderr:', data);
        });

        child.on('error', (err) => {
            if (resolved) return;
            console.error(222222222222, '[+] error', err)
            endTime = Date.now();
            reject({
                pid: child.pid,
                startTime,
                endTime,
                error: err,
                stderr: stderrData
            });
        });

        child.on('exit', (e) => {
            console.log(9999999999999, `[+exited] with code ${e}`);
            if (resolved) return
            resolved = resolve({
                pid: child.pid,
                startTime,
                endTime,
                outputPath
            });

        })

        child.on('close', (e) => {
            console.log(9999999999999, `[+closed] with code ${e}`);
            if (resolved) return
            resolved = resolve({
                pid: child.pid,
                startTime,
                endTime,
                outputPath
            });
        })

        // Clean up timeout on resolution
        const cleanup = () => {
            clearTimeout(timeout);
            resolved = true;
        };

    });
}
async function storeTagsOfScript(videoDetailId, jsonPath) {
    try {
        console.log('Reading tags from:', jsonPath);
        const fullPath = path.join(jsonPath);
        let json = fs.readFileSync(fullPath, 'utf8');
        json = JSON.parse(json)
        const tags = Object.keys(json);
        await videoDetailService.updateAITags(videoDetailId, tags);
    } catch (error) {
        console.error('Error storing tags:', error);
        throw error;
    }
}
