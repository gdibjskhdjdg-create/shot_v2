const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');

const Service = require("../../_default/service");
const { logError } = require('../../../helper/log.tool');

const { VideoFile } = require("../../_default/model");

const { videoFileService } = require('./index');
const { projectService } = require('../project/index');
const UserService = require('../user/User.service');
const { log } = require('../../../helper/showLog');


class WatchFolderVideoFileService extends Service {

    constructor() {
        super(VideoFile);
        this.hasWatchFolderPath = false;
        this.hasWatchFolderNotTranscodePath = false;
        this.hasWatchFolderAIPath = false;

        if(appConfigs.WATCH_FOLDER_FROM_APP_ROOT){
            this.watchFolderPath = path.join(__dirname, '..', '..', '..', appConfigs.WATCH_FOLDER_FROM_APP_ROOT);
            this.hasWatchFolderPath = true;
        } 
        if(appConfigs.WATCH_FOLDER_NOT_TRANSCODE_FROM_APP_ROOT){
            this.watchFolderNotTranscodePath = path.join(__dirname, '..', '..', '..', appConfigs.WATCH_FOLDER_NOT_TRANSCODE_FROM_APP_ROOT);
            this.hasWatchFolderNotTranscodePath = true;
        } 
        if(appConfigs.WATCH_FOLDER_AI_FROM_APP_ROOT){
            this.watchFolderAIPath = path.join(__dirname, '..', '..', '..', appConfigs.WATCH_FOLDER_AI_FROM_APP_ROOT);
            this.hasWatchFolderAIPath = true;
        } 
    }

    async checkNewFile() {
        const watchFolderTypes = []

        if(this.hasWatchFolderPath){
            watchFolderTypes.push({ path: this.watchFolderPath, needTranscode: true, isAI: false })
        }
        if(this.hasWatchFolderNotTranscodePath){
            watchFolderTypes.push({ path: this.watchFolderNotTranscodePath, needTranscode: false, isAI: false })
        }
        if(this.hasWatchFolderAIPath){
            watchFolderTypes.push({ path: this.watchFolderAIPath, needTranscode: false, isAI: true })
        }

        for (let j = 0; j < watchFolderTypes.length; j++) {
            const videoDir = watchFolderTypes[j].path;
            fs.mkdirSync(videoDir, { recursive: true });

            const folders = await readdir(videoDir);
            for (let i = 0; i < folders.length; i++) {
                await projectService.findOrCreateProjectWithTitle(folders[i]);
                await this.findFile(videoDir, folders[i], watchFolderTypes[j].needTranscode, watchFolderTypes[j].isAI);
            }
        }
        return
    }

    async checkAndRemoveFolders() {
        const watchFolderTypes = [
            { path: this.watchFolderPath },
            { path: this.watchFolderNotTranscodePath },
            { path: this.watchFolderAIPath },
        ]
        for (let j = 0; j < watchFolderTypes.length; j++) {
            const videoDir = watchFolderTypes[j].path;
            if (fs.existsSync(videoDir)) {
                const folders = await readdir(videoDir);
                for (let i = 0; i < folders.length; i++) {
                    await this.checkFolderForRemove(videoDir, folders[i]);
                }
            }
        }
    }

    async checkFolderForRemove(mainPath, pathToFile) {
        return new Promise(async (resolve, reject) => {
            try {
                let isEmpty = true;

                const fullPath = path.join(mainPath, pathToFile);
                var lastPath = fs.statSync(fullPath);
                if (lastPath.isFile()) {
                    return resolve(false)
                }
                else {
                    const folders = await readdir(fullPath);
                    for (let i = 0; i < folders.length; i++) {
                        try {
                            let response = await this.checkFolderForRemove(mainPath, path.join(pathToFile, folders[i]))
                            if (!response) {
                                isEmpty = false;
                                break;
                            }
                        }
                        catch (err) { }
                    }

                    if (isEmpty) {
                        const checkIsEmpty = await readdir(fullPath);
                        if (checkIsEmpty.length === 0) {
                            fs.rmdirSync(fullPath);
                            log(`remove folder: ${fullPath}`);
                        }
                    }
                }

                return resolve(isEmpty);
            }
            catch (err) {
                return resolve();
            }
        })
    }

    async findFile(mainPath, pathToFile, needTranscode = true, isAI = false) {
        return new Promise(async (resolve, reject) => {
            try {
                const fullPath = path.join(mainPath, pathToFile);
                var lastPath = fs.statSync(fullPath);
                if (lastPath.isFile()) {
                    setTimeout(async () => {
                        try {
                            const checkSize = fs.statSync(fullPath);
                            if (checkSize.size === lastPath.size) {
                                await this.saveAndAttachVideoFile(fullPath, pathToFile, needTranscode, isAI)
                            }
                            return resolve()
                        }
                        catch (err) {
                            return resolve();
                        }
                    }, 500);
                }
                else {
                    const folders = await readdir(fullPath);
                    for (let i = 0; i < folders.length; i++) {
                        try {
                            await this.findFile(mainPath, path.join(pathToFile, folders[i]), needTranscode, isAI)
                        }
                        catch (err) {
                            logError("find_file", err, "move_files")
                        }
                    }

                    // const checkIsEmpty = await readdir(fullPath);
                    // if (checkIsEmpty.length === 0) {
                    //     fs.rmdirSync(fullPath);
                    // }

                    return resolve();
                }
            }
            catch (err) {
                return resolve();
            }
        })
    }

    async saveAndAttachVideoFile(fullPath, pathToFile, needTranscode = true, isAI = false) {
        const splitPath = pathToFile.split(path.sep);
        if (splitPath.length < 2) {
            return;
        }
        const fileName = splitPath.splice(splitPath.length - 1, 1)[0];
        const projectName = splitPath[0];
        let userId = null;
        if (splitPath[splitPath.length - 1].includes("user_")) {
            const userFolder = splitPath.splice(splitPath.length - 1, 1);
            userId = (userFolder[0].split("user_"))[1];
            try {
                const user = await UserService.getById(userId);
                if (!user) {
                    userId = null;
                }
            }
            catch (err) {
                userId = null;
            }
        }

        const project = await projectService.findOrCreateProjectWithTitle(projectName);
        const originalPath = splitPath.join(path.sep);

        await videoFileService.moveAndStoreFile(fullPath, fileName, {
            userId,
            projectId: project[0].id,
            originalPath,
            convertRequired: true,
            needTranscode,
            isAI
        })
    }

}

module.exports = new WatchFolderVideoFileService();
