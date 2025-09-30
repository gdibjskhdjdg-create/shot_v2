const path = require('path');
const fs = require('fs');
const { zip } = require('zip-a-folder');
const { FFmpegExecute } = require('../FFmpeg/FFmpeg.service');
const { generateRandomCode } = require('../../../helper/general.tool');
const emitter = require('../../_default/eventEmitter');

// Import functional services directly
const exportVideoService = require('./ExportVideo.service');
const videoFileService = require('./VideoFile.service');
const videoTemplateService = require('./VideoTemplate.service');
const shotService = require('../shotList/Shot.service');
const shotExportService = require('../shotList/ShotExport.service');


const resolutions = {
    144: { res: [256, 144], maxBitrate: 1 * 1024 * 1024 },
    234: { res: [480, 234], maxBitrate: 1 * 1024 * 1024 },
    480: { res: [842, 480], maxBitrate: 2 * 1024 * 1024 },
    720: { res: [1280, 720], maxBitrate: 7 * 1024 * 1024 },
    1080: { res: [1920, 1080], maxBitrate: 10 * 1024 * 1024 },
    3840: { res: [1920, 2160], maxBitrate: 10 * 1024 * 1024 },
};

// --- FFMPEG Command Generators ---

const ffmpegCutCommand = (filePath, targetDir, start, end, cutName) => {
    const outputFilePath = path.join(targetDir, `${cutName}.cut.mp4`);
    console.log(`Cutting ${filePath} from ${start} to ${end}`);
    let command = `ffmpeg -y -ss ${start}`;
    if (end) command += ` -to ${end}`;
    command += ` -i "${filePath}" -c:v copy -c:a copy "${outputFilePath}"`;
    return { command, path: outputFilePath };
};

const ffmpegOptimizeCommand = (filePath, targetDir, ext, outputConfig, outputBitrate) => {
    const outputFilePath = path.join(targetDir, `optimize.${ext}`);
    console.log(`Optimizing video ${filePath}`, outputConfig, outputBitrate);
    const command = `ffmpeg -y -i "${filePath}" -vf scale="${outputConfig.res[0]}:${outputConfig.res[1]}:force_original_aspect_ratio=decrease,pad=${outputConfig.res[0]}:${outputConfig.res[1]}:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -b:v ${outputBitrate} -maxrate ${outputBitrate} -bufsize 15M -c:a copy "${outputFilePath}"`;
    return { command, path: outputFilePath };
};

const ffmpegConcatCommand = (exportFileCode, filePaths = [], targetDir, isMute, outputBitrate) => {
    const outputFilePath = path.join(targetDir, `${exportFileCode}_pure.mp4`);
    let command = 'ffmpeg -y ';
    filePaths.forEach(fp => { command += ` -i "${fp}" `; });

    if (filePaths.length > 1) {
        command += ' -filter_complex "';
        filePaths.forEach((_, i) => { command += `[${i}:v]setsar=1[v${i}];`; });
        if (!isMute) {
            filePaths.forEach((_, i) => { command += `[v${i}][${i}:a]`; });
            command += `concat=n=${filePaths.length}:v=1:a=1[v][a]" -map "[v]" -map "[a]"`;
        } else {
            filePaths.forEach((_, i) => { command += `[v${i}]`; });
            command += `concat=n=${filePaths.length}:v=1:a=0[v]" -map "[v]"`;
        }
    } else if (isMute) {
        command += '-an';
    }

    command += ` -c:v libx264 -b:v ${outputBitrate} -maxrate ${outputBitrate} -bufsize 15M "${outputFilePath}"`;
    return { command, path: outputFilePath };
};

const ffmpegGifCommand = (exportFileCode, filePath, targetDir, gifTime) => {
    const outputFilePath = path.join(targetDir, `${exportFileCode}.gif`);
    const command = `ffmpeg -y -ss ${gifTime[0]} -to ${gifTime[1]} -i "${filePath}" -filter_complex "fps=10,scale=360:-1[s]; [s]split[a][b]; [a]palettegen[palette]; [b][palette]paletteuse" "${outputFilePath}"`;
    return { command, path: outputFilePath };
};

const ffmpegLogoCommand = (exportFileCode, filePath, targetDir, logo, left, top, alpha = 1, outputBitrate) => {
    const outputFilePath = path.join(targetDir, `${exportFileCode}_logo.mp4`);
    const command = `ffmpeg -y -i "${filePath}" -i "${logo}" -filter_complex "[1]format=yuva444p,colorchannelmixer=aa=${alpha}[logo];[0][logo]overlay=${left}:${top}" -c:v libx264 -b:v ${outputBitrate} -maxrate ${outputBitrate} -bufsize 15M -c:a copy "${outputFilePath}"`;
    return { command, path: outputFilePath };
};


// --- Main Export Process ---

const processVideoExport = async (file) => {
    const { id: exportFileId, code: exportFileCode, qualityExport: quality, isMute, logoParams: logo, textParams: text, gifTime, bitrate: exportBitrate, detail: details } = file;

    const exportDir = exportVideoService.getPathForExport(exportFileCode);
    fs.mkdirSync(exportDir, { recursive: true });

    let outputBitrate = "10M"; // Default

    const videoFileProcessingPromises = details.map(async (detail) => {
        const video = await videoFileService.getById(detail.videoId);
        if (!video) throw new Error(`Video with id ${detail.videoId} not found.`);

        let videoBitrate = video.bitrate;
        if (!videoBitrate && video.fullInfo) {
            try {
                const mediaInfo = JSON.parse(video.fullInfo);
                videoBitrate = mediaInfo.track.find(item => item["@type"] === "Video")?.BitRate;
            } catch (e) { /* Ignore parsing error */ }
        }
        
        if (exportBitrate && exportBitrate < videoBitrate) videoBitrate = exportBitrate;
        outputBitrate = `${Math.floor(videoBitrate / 1000000)}M`;

        return {
            ...detail.dataValues,
            videoPath: path.join(video.path, video.name),
            originalName: video.originalName,
            format: video.format
        };
    });

    const videoFiles = await Promise.all(videoFileProcessingPromises);
    if (videoFiles.length === 0) throw new Error("No video files to process.");

    await exportVideoService.setPendingExportFile(exportFileId);

    const outputConfig = resolutions[quality];
    const outputData = [];

    for (let i = 0; i < videoFiles.length; i++) {
        const data = videoFiles[i];
        const { id, videoPath, startCutTime, endCutTime } = data;
        let sourceFilePath = videoPath;
        let lastCommand, lastPid, startTimeLastCommand, endTimeLastCommand;

        try {
            console.log(`Start processing detail id=${id}`);
            await exportVideoService.setPendingDetail(id);
            const tempDir = path.join(exportDir, `temp`, id.toString());
            fs.mkdirSync(tempDir, { recursive: true });

            if (startCutTime) {
                const { command, path } = ffmpegCutCommand(sourceFilePath, exportDir, startCutTime, endCutTime, `${exportFileCode}_${i}`);
                sourceFilePath = path;
                lastCommand = command;
                const exe = await FFmpegExecute(command, (pid, startTime) => { /* ... log ... */ });
                endTimeLastCommand = exe.endTime;
            }
            
            const { command: optCommand, path: optPath } = ffmpegOptimizeCommand(sourceFilePath, tempDir, 'mp4', outputConfig, outputBitrate);
            sourceFilePath = optPath;
            lastCommand = optCommand;
            const exeOpt = await FFmpegExecute(optCommand, (pid, startTime) => { /* ... log ... */ });
            endTimeLastCommand = exeOpt.endTime;

            const targetPath = path.join(exportDir, `${id}-${generateRandomCode(5)}-output.mp4`);
            fs.copyFileSync(sourceFilePath, targetPath);
            outputData.push({ id, src: targetPath });

            fs.rmSync(tempDir, { recursive: true, force: true });
            await exportVideoService.setCompleteDetail(id);

        } catch (error) {
            console.error(`Error processing detail ${id}:`, error);
            await exportVideoService.setErrorDetail(id);
            throw error; // Propagate error to stop the main process
        } finally {
            await exportVideoService.setLastCommandDetailFile(id, lastCommand, startTimeLastCommand, endTimeLastCommand, lastPid);
        }
    }

    // --- Final Composition ---
    let lastCommand, lastPid, startTimeLastCommand, endTimeLastCommand;
    let sourceFilePath = null;

    try {
        const videosPath = outputData.map(x => x.src);
        const { command: concatCmd, path: concatPath } = ffmpegConcatCommand(exportFileCode, videosPath, exportDir, isMute, outputBitrate);
        lastCommand = concatCmd;
        sourceFilePath = concatPath;
        const exeConcat = await FFmpegExecute(concatCmd); // Add logging hooks if needed

        if (gifTime) {
            const { command: gifCmd } = ffmpegGifCommand(exportFileCode, sourceFilePath, exportDir, JSON.parse(gifTime));
            lastCommand = gifCmd;
            await FFmpegExecute(gifCmd); 
        }

        if (logo) {
            const logoParams = JSON.parse(logo);
            const logoPath = videoTemplateService.logoTemplateWithFullPath(logoParams.src);
            const { command: logoCmd, path: logoPathOutput } = ffmpegLogoCommand(exportFileCode, sourceFilePath, exportDir, logoPath, logoParams.left, logoParams.top, logoParams.opacity, outputBitrate);
            sourceFilePath = logoPathOutput;
            lastCommand = logoCmd;
            await FFmpegExecute(logoCmd);
        }

        const targetFileName = `${exportFileCode}.mp4`;
        fs.renameSync(sourceFilePath, path.join(exportDir, targetFileName));
        outputData.forEach(tmp => fs.existsSync(tmp.src) && fs.unlinkSync(tmp.src));

        await exportVideoService.setCompleteExportFile(exportFileId);
        await makeZipFromShots(exportFileId);

    } catch (error) {
        console.error('Error during final composition:', error);
        await exportVideoService.setErrorExportFile(exportFileId);
        throw error;
    } finally {
        await exportVideoService.setLastCommandExportFile(exportFileId, lastCommand, startTimeLastCommand, endTimeLastCommand, lastPid);
    }
};

const makeZipFromShots = async (exportId) => {
    const details = await exportVideoService.findDetailsByExportId(exportId);
    if (!details || details.length === 0) return;

    const { code: exportCode } = details[0].export.toJSON();
    const exportFolder = exportVideoService.getPathForExport(exportCode);
    
    const shotIds = details.map(d => d.shotId).filter(Boolean);
    if (shotIds.length === 0) return;

    const shots = await shotService.getShotsByIds(shotIds);

    for (const shot of shots) {
        // Export Excel
        const { path: excelPath, fileName: excelName } = await shotExportService.exportShots('excel', [shot.id]);
        if (fs.existsSync(excelPath)) {
            fs.copyFileSync(excelPath, path.join(exportFolder, excelName));
        }

        // Copy gallery images
        const galleries = shot.gallery ? JSON.parse(shot.gallery) : [];
        if (galleries.length > 0) {
            const galleryDir = path.join(exportFolder, 'images');
            fs.mkdirSync(galleryDir, { recursive: true });
            for (const gallery of galleries) {
                const sourceImagePath = path.join(exportVideoService.getRootDir(), process.env.STORE_FOLDER_FROM_APP_ROOT, gallery.path, gallery.fileName);
                if (fs.existsSync(sourceImagePath)) {
                    fs.copyFileSync(sourceImagePath, path.join(galleryDir, gallery.fileName));
                }
            }
        }
    }
    
    const targetZip = path.join(exportFolder, '..', `${exportCode}.zip`);
    if (fs.existsSync(targetZip)) fs.unlinkSync(targetZip);
    await zip(exportFolder, targetZip);
};

module.exports = {
    resolutions,
    processVideoExport,
    makeZipFromShots,
};