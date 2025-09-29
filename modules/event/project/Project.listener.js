const { log } = require("../../../helper/showLog");
const { projectService } = require("../../services/project/index");

class Project_Listener {
    constructor(emitter) {
        log("[+] [Listener] Project");
        emitter.on('moveAndStoreFile', (data) => projectService.updateProjectStatus(data.projectId));
        emitter.on('assignVideo2Shot', (data) => projectService.updateProjectStatus(data.projectId));
        emitter.on('updateShotCountVideoFile', (data) => projectService.updateProjectStatus(data.projectId));
        emitter.on('updateVideoFileShotCount', (data) => projectService.updateProjectStatus(data.projectId));
        emitter.on('updateVideoFileShotCountProject', (projectId) => projectService.updateProjectStatus(projectId));
        emitter.on('equalizeSubmit', (data) => projectService.updateProjectStatus(data.projectId));
    }
}

module.exports = Project_Listener;