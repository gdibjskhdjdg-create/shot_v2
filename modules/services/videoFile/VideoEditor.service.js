const path = require('path');

const Service = require("../../_default/service");
const { zip } = require('zip-a-folder');
const fs = require('fs')
const Sequelize = require('sequelize');
const { FFmpegExecute } = require('../FFmpeg/FFmpeg.service');
const { generateRandomCode } = require('../../../helper/general.tool');
const emitter = require('../../_default/eventEmitter');
const ShotExportService = require('../shotList/ShotExport.service');
const ShotScoreService = require('../shotList/ShotScore.service')


const resolutions = {
    144: {
        res: [256, 144],
        maxBitrate: 1 * 1024 * 1024
    },
    234: {
        res: [480, 234],
        maxBitrate: 1 * 1024 * 1024
    },
    480: {
        res: [842, 480],
        maxBitrate: 2 * 1024 * 1024
    },
    720: {
        res: [1280, 720],
        maxBitrate: 7 * 1024 * 1024
    },
    1080: {
        res: [1920, 1080],
        maxBitrate: 10 * 1024 * 1024
    },
    3840: {
        res: [1920, 2160],
        maxBitrate: 10 * 1024 * 1024
    },
}



class VideoEditor_Service extends Service {

    constructor(
        exportVideoService = () => { },
        videoFileService = () => { },
        videoTemplateService = () => { },
        shotService = () => { },
    ) {
        super();

        this.outputConfig = null;
        this.outputBitrate = 10 * 1024 * 1024;
        this.exportVideoService = exportVideoService;
        this.videoFileService = videoFileService;
        this.videoTemplateService = videoTemplateService;
        this.shotService = shotService
        this.shotExport = new ShotExportService(this.shotService, new ShotScoreService());
    }

    async init(file) {
        return new Promise(async (resolve, reject) => {
            const exportFileId = file.id;
            const exportFileCode = file.code;
            const quality = file.qualityExport;
            const isMute = file.isMute;
            const logo = file.logoParams;
            const text = file.textParams;
            const gifTime = file.gifTime;
            const exportBitrate = file.bitrate

            const exportDir = this.exportVideoService.getPathOfFolder(exportFileCode);
            fs.mkdirSync(exportDir, { recursive: true });

            const videoFiles = [];
            let minBitRate = 10000000;
            let bitrate = null

            for (const detail of file.detail) {
                const video = await this.videoFileService.getById(detail.videoId)

                const videoPath = path.join(video.path, video.name);
                const { dataValues } = detail;

                try {
                    let videoBitrate = video.bitrate
                    if (!videoBitrate) {
                        try {
                            const mediaInfoData = JSON.parse(video.fullInfo);
                            videoBitrate = (mediaInfoData.track.find(item => item["@type"] === "Video"))?.BitRate;
                        } catch (err) { }
                    }
                    if (!videoBitrate) {
                        videoBitrate = minBitRate
                    }

                    bitrate = exportBitrate && exportBitrate < videoBitrate ? exportBitrate : videoBitrate;
                    // if (bitrate < minBitRate) {
                    //     minBitRate = bitrate;
                    // }
                }
                catch (err) {
                    console.log(33333333, err)
                }

                videoFiles.push({
                    ...dataValues,
                    videoPath,
                    originalName: video.originalName,
                    format: video.format
                });
            }

            if (videoFiles.length == 0) {
                return reject();
            }

            await this.exportVideoService.setPendingExportFile(exportFileId);

            let startTimeLastCommand = null;
            let endTimeLastCommand = null;
            let lastCommand = null;
            let lastPid = null;
            let sourceFilePath = null;

            const ext = 'mp4' // format
            const outputData = [];

            this.outputConfig = resolutions[quality]
            // this.outputBitrate = bitrate > resolutions[quality].maxBitrate ? resolutions[quality].maxBitrate : bitrate;
            this.outputBitrate = bitrate;
            this.outputBitrate = `${Math.floor(this.outputBitrate / 1000000)}M`;

            for (let i = 0; i < videoFiles.length; i++) {
                const data = videoFiles[i];
                const { id, videoPath, originalName, format, startCutTime, endCutTime } = data
                try {
                    console.log('start process on detail id=' + id)
                    console.log('===================================')
                    await this.exportVideoService.setPendingDetail(id)
                    sourceFilePath = videoPath

                    const tempDir = path.join(exportDir, `temp`, id.toString())
                    /* Create temp dir for folder code */
                    if (!fs.existsSync(tempDir)) {
                        fs.mkdirSync(tempDir, { recursive: true })
                    }

                    if (startCutTime) {
                        /* cut video */
                        const cutName = `${exportFileCode}_${i}`
                        const cutCommand = this.cutVideo_ffmpegcommand(sourceFilePath, exportDir, startCutTime, endCutTime, cutName)
                        sourceFilePath = cutCommand.path
                        lastCommand = cutCommand.command;

                        const exeCut = await FFmpegExecute(cutCommand.command, async (pid, startTime) => {
                            lastPid = pid;
                            startTimeLastCommand = startTime;

                            await this.exportVideoService.setLastCommandDetailFile(id, lastCommand, startTime, null, pid)
                            await this.exportVideoService.setLastCommandExportFile(exportFileId, lastCommand, startTime, null, pid)
                        });

                        endTimeLastCommand = exeCut.endTime;
                    }

                    // optimize video
                    const optimizeCommand = this.optimizeVideoFile_ffmpegcommand(sourceFilePath, tempDir, ext)
                    sourceFilePath = optimizeCommand.path
                    lastCommand = optimizeCommand.command

                    const exeOpt = await FFmpegExecute(optimizeCommand.command, async (pid, startTime) => {
                        lastPid = pid;
                        startTimeLastCommand = startTime;

                        await this.exportVideoService.setLastCommandDetailFile(id, lastCommand, startTime, null, pid)
                        await this.exportVideoService.setLastCommandExportFile(exportFileId, lastCommand, startTime, null, pid)
                    });

                    endTimeLastCommand = exeOpt.endTime

                    const targetPath = exportDir + `/${id}-${generateRandomCode(5)}-output.${ext}`

                    fs.copyFileSync(sourceFilePath, targetPath)
                    outputData.push({ id, src: targetPath })

                    /* Remove tmp dir */
                    fs.rmdirSync(path.join(exportDir, `temp`), { recursive: true });

                    await this.exportVideoService.setCompleteDetail(id)

                } catch (error) {
                    console.log('error detail ' + id, error)
                    await this.exportVideoService.setErrorDetail(id)
                    endTimeLastCommand = Date.now()
                    await this.exportVideoService.setErrorExportFile(exportFileId)
                    return reject()

                } finally {
                    console.log('finally detail ============================')
                    await this.exportVideoService.setLastCommandDetailFile(id, lastCommand, startTimeLastCommand, endTimeLastCommand, lastPid)
                    await this.exportVideoService.setLastCommandExportFile(exportFileId, lastCommand, startTimeLastCommand, endTimeLastCommand, lastPid)
                }
            }

            console.log('continue ============================')
            try {
                sourceFilePath = null
                const videosPath = outputData.map(x => x.src);

                console.log('start concat videos')
                console.log('===================================')

                const { command: contactCommand, path: concatPath } = this.contactVideos_ffmpegcommand(exportFileCode, videosPath, exportDir, isMute)
                lastCommand = contactCommand
                sourceFilePath = concatPath

                const exeConcat = await FFmpegExecute(contactCommand)
                lastPid = exeConcat.pid
                startTimeLastCommand = exeConcat.startTime
                endTimeLastCommand = exeConcat.endTime

                if (gifTime) {
                    console.log('start generate gif from video')
                    console.log('===================================')

                    const { command: gifCommand, path: videoWithGif } = this.generateGif_ffmpegcommand(exportFileCode, sourceFilePath, exportDir, JSON.parse(gifTime))
                    // sourceFilePath = videoWithGif this an image
                    lastCommand = gifCommand;

                    const exeGif = await FFmpegExecute(gifCommand, async (pid, startTime) => {
                        lastPid = pid;
                        startTimeLastCommand = startTime;

                        await this.exportVideoService.setLastCommandExportFile(exportFileId, gifCommand, startTime, null, pid)
                    });

                    endTimeLastCommand = exeGif.endTime;
                }

                if (logo) {
                    console.log('start attach logo to video')
                    console.log('===================================')
                    const logoParams = JSON.parse(logo)
                    const logoPath = this.videoTemplateService.logoTemplateWithFullPath(logoParams.src)

                    const { command: logoCommand, path: videoWithLogo } = this.setLogo_ffmpegcommand(exportFileCode, sourceFilePath, exportDir, logoPath, logoParams.left, logoParams.top, logoParams.opacity)
                    sourceFilePath = videoWithLogo;
                    lastCommand = logoCommand;

                    try {
                        const exeLogo = await FFmpegExecute(logoCommand, async (pid, startTime) => {
                            lastPid = pid;
                            startTimeLastCommand = startTime;

                            await this.exportVideoService.setLastCommandExportFile(exportFileId, logoCommand, startTime, null, pid)
                        });

                        endTimeLastCommand = exeLogo.endTime;
                    }
                    catch (err) {
                        console.log(err)
                    }
                }

                const targetFileName = `${exportFileCode}.${ext}`;
                fs.renameSync(sourceFilePath, path.join(exportDir, targetFileName));
                // remove outputs
                for (const tmpData of outputData) {
                    const { id, src } = tmpData
                    if (fs.existsSync(src)) fs.unlinkSync(src)
                }
                await this.exportVideoService.setCompleteExportFile(exportFileId)

                try {
                    await this.MakeZipShots(exportFileId)
                }
                catch (err) {
                    console.log(111111, err)
                }

                return resolve()

            } catch (error) {
                console.log('error', error)
                // throw error?.message || "something wrong"
                endTimeLastCommand = Date.now()
                await this.exportVideoService.setErrorExportFile(exportFileId)
                return reject()

            } finally {
                await this.exportVideoService.setLastCommandExportFile(exportFileId, lastCommand, startTimeLastCommand, endTimeLastCommand, lastPid)
            }
        })
    }

    optimizeVideoFile_ffmpegcommand(filePath, targetDir, ext) {

        const outputFilePath = `${targetDir}/optimize.${ext}`

        console.log(`start optimizing video ${filePath}`, this.outputConfig, this.outputBitrate)
        // const command = `ffmpeg -y -i "${filePath}" -vf scale="${this.outputConfig.res[0]}:${this.outputConfig.res[1]}:force_original_aspect_ratio=decrease,pad=${this.outputConfig.res[0]}:${this.outputConfig.res[1]}:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -c:a copy "${outputFilePath}"`
        const command = `ffmpeg -y -i "${filePath}" -vf scale="${this.outputConfig.res[0]}:${this.outputConfig.res[1]}:force_original_aspect_ratio=decrease,pad=${this.outputConfig.res[0]}:${this.outputConfig.res[1]}:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -b:v ${this.outputBitrate} -maxrate ${this.outputBitrate} -bufsize 15M -c:a copy "${outputFilePath}"`

        console.log(33333333333, command)

        return { command, path: outputFilePath }
    }

    contactVideos_ffmpegcommand(exportFileCode, arrayFilePath = [], targetDir = process.env.Content_PATH, isMute = false) {
        const outputFilePath = `${targetDir}/${exportFileCode}_pure.mp4`
        let command = ' ffmpeg -y '

        for (const filePath of arrayFilePath) {
            command += ` -i "${filePath}" `
        }

        if (arrayFilePath && arrayFilePath.length > 1) {
            command += ' -filter_complex "'
            for (let i = 0; i < arrayFilePath.length; i++) {
                command += `[${i}:v]setsar=1[v${i}];`
            }
        }

        if (!isMute) {
            if (arrayFilePath && arrayFilePath.length > 1) {
                for (let i = 0; i < arrayFilePath.length; i++) {
                    command += `[v${i}][${i}:a]`
                }
                command += `concat=n=${arrayFilePath.length}:v=1:a=1[v][a]" -map "[v]" -map "[a]"`
            }
        } else {
            if (arrayFilePath && arrayFilePath.length > 1) {
                for (let i = 0; i < arrayFilePath.length; i++) {
                    command += `[v${i}]`
                }
                command += `concat=n=${arrayFilePath.length}:v=1:a=0[v]" -map "[v]"`
            } else {
                command += `-an`
            }
        }

        command += ` -c:v libx264 -b:v ${this.outputBitrate} -maxrate ${this.outputBitrate} -bufsize 15M "${outputFilePath}"`

        return { command, path: outputFilePath }
    }

    generateGif_ffmpegcommand(exportFileCode, filePath, targetDir, gifTim) {
        const outputFilePath = `${targetDir}/${exportFileCode}.gif`;
        let command = `ffmpeg -y -ss ${gifTim[0]} -to ${gifTim[1]} -i "${filePath}" -filter_complex "fps=10,scale=360:-1[s]; [s]split[a][b]; [a]palettegen[palette]; [b][palette]paletteuse" "${outputFilePath}"`
        return { command, path: outputFilePath }
    }

    setLogo_ffmpegcommand(exportFileCode, filePath, targetDir, logo, left, top, alpha = 1) {
        const outputFilePath = `${targetDir}/${exportFileCode}_logo.mp4`;
        let command = `ffmpeg -y -i "${filePath}" -i "${logo}" -filter_complex "[1]format=yuva444p,colorchannelmixer=aa=${alpha}[logo];[0][logo]overlay=${left}:${top}" -c:v libx264 -b:v ${this.outputBitrate} -maxrate ${this.outputBitrate} -bufsize 15M -c:a copy "${outputFilePath}"`
        return { command, path: outputFilePath }
    }

    setText_ffmpegcommand(filePath, targetPath, text, x, y) {
        // https://stackoverflow.com/questions/17623676/text-on-video-ffmpeg
        // ffmpeg -i input.mp4 -vf "drawtext=fontfile=/path/to/font.ttf:text='Stack Overflow':fontcolor=white:fontsize=24:box=1:boxcolor=black@0.5:boxborderw=5:x=(w-text_w)/2:y=(h-text_h)/2" -codec:a copy output.mp4
    }

    cutVideo_ffmpegcommand(filePath, targetDir, start = "00:00:00", end = null, cutName) {
        const outputFilePath = `${targetDir}/${cutName}.cut.mp4`

        console.log(`start cutting ${filePath} from ${start} frame to ${end} frame`)
        let command = `ffmpeg -y -ss ${start}`
        if (end) {
            command += ` -to ${end}`
        }
        command += ` -i "${filePath}" -c:v copy -c:a copy "${outputFilePath}"`

        return { command, path: outputFilePath }
    }

    async MakeZipShots(exportId) {
        const exportShotsData = await this.exportVideoService.findAllDetailByExportId(exportId)
        const exportShots = exportShotsData.map(item => item.toJSON())
        if (!exportShots?.[0]) return exportId
        const { isProduct, code: exportCode } = exportShots[0].export;
        const folderExport = this.exportVideoService.getPathOfFolder(exportCode)

        let shotsId = []
        const videosId = []
        for (const eShot of exportShots) {
            const { shotId, videoId } = eShot
            if (shotId) shotsId.push(shotId)
            else if (videoId) videosId.push(videoId)
        }

        if (videosId.length) {
            const shotsOfVideos = await this.shotService.getByAttribute('videoFileId', videosId)
            shotsId = [...shotsId, ...shotsOfVideos.map(x => x.toJSON()).map(x => x.id)]
        }

        if (shotsId.length == 0) return exportId
        const shots = await this.shotService.getByIds(shotsId)

        for (const shot of shots) {

            // export excel
            const { path: excelPath, fileName: excelName } = (await this.shotExport.exportShot('excel', [shot.id]))
            if (fs.existsSync(excelPath)) {
                fs.copyFileSync(excelPath, path.join(folderExport, excelName));
            }

            // copy gallery shots to export folder
            const galleries = shot.gallery ? JSON.parse(shot.gallery) : []
            if (galleries.length) {
                for (const gallery of galleries) {

                    const fromGalleryPath = path.join(this.exportVideoService.getRootDir(), appConfigs.STORE_FOLDER_FROM_APP_ROOT, gallery.path, gallery.fileName)
                    const toGalleryPath = path.join(this.exportVideoService.getPathOfFolder(exportCode), 'images', gallery.fileName)

                    const targetGalleryFolder = path.join(toGalleryPath, "..")
                    if (!fs.existsSync(targetGalleryFolder)) {
                        fs.mkdirSync(targetGalleryFolder, { recursive: true })
                    }

                    if (fs.existsSync(fromGalleryPath)) {
                        fs.copyFileSync(fromGalleryPath, toGalleryPath);
                    }
                }
            }
            const targetZip = path.join(folderExport, '..', exportCode + ".zip");

            try {
                if (fs.existsSync(targetZip)) {
                    fs.rmdirSync(targetZip);
                }
            } catch (error) {

            }

            await zip(folderExport, targetZip);
        }
    }
}

module.exports = VideoEditor_Service;