const { getDataFromReqQuery } = require("../../../helper/general.tool");
const ResponseDTO = require("../../_default/Response.dto");
const ProjectResponse = require("../../dto/project/Project.response");
const ProjectQuery = require("../../dto/project/Project.query");
const ProjectValidation = require("../../validation/project/Project.validation");
const { projectService } = require("../../services/project/index");

async function getProjects(req, res) {
    const query = getDataFromReqQuery(req);
    const filters = ProjectQuery.create({
        page: 1, take: 10, ...query
    });

    let userId = null;
    // if(user.permission !== 'admin'){
    //     userId = req.user.id;
    // }

    const { projects, count } = await projectService.getProjects({ ...filters, userId });

    return ResponseDTO.success(res, { projects: ProjectResponse.create(projects), count });
}

async function exportUserReportProject(req, res) {
    const { exportType, projectId } = req.params
    const query = getDataFromReqQuery(req);
    let result = {}
    if (exportType == 'excel') {
        result = await projectService.exportExcelUserReportProject(projectId, query)
    }
    return ResponseDTO.success(res, result)
}

async function userReportProject(req, res) {
    const { projectId } = req.params;
    const query = getDataFromReqQuery(req);
    const report = await projectService.userReportProject(projectId, query)
    return ResponseDTO.success(res, report)
}

async function exportReportPerProject(req, res) {
    const { exportType } = req.params
    const query = getDataFromReqQuery(req);
    let result = {}
    if (exportType == 'excel') {
        result = await projectService.exportExcelReportPerProject(query)
    }
    return ResponseDTO.success(res, result)
}

async function reportPerProject(req, res) {
    const query = getDataFromReqQuery(req);
    const report = await projectService.reportPerProject(query)
    return ResponseDTO.success(res, report)
}

async function createProjects(req, res) {
    const validData = ProjectValidation.createProject(req.body);
    const project = await projectService.createProject(validData);

    return ResponseDTO.success(res, { project: ProjectResponse.create(project) });
}

async function updateProjects(req, res) {
    const { projectId } = req.params;
    const validData = ProjectValidation.createProject(req.body);
    const project = await projectService.updateProject(projectId, validData);

    return ResponseDTO.success(res, { project: ProjectResponse.create(project) });
}

async function assignVideoFilesOfProjectToUser(req, res) {
    const { projectId, userId } = req.params;
    return ResponseDTO.success(res);
}

async function deleteProjects(req, res) {
    const { projectId } = req.params;
    await projectService.deleteProject(projectId);
    return ResponseDTO.success(res);
}


async function deleteMainFileOfProject(req, res) {
    const { projectId } = req.params;
    await projectService.deleteMainFileOfProject(projectId);
    return ResponseDTO.success(res);
}


module.exports = {
    getProjects,
    exportUserReportProject,
    userReportProject,
    exportReportPerProject,
    reportPerProject,
    createProjects,
    updateProjects,
    assignVideoFilesOfProjectToUser,
    deleteProjects,
    deleteMainFileOfProject
}