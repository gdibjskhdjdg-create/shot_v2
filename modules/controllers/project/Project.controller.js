const ResponseDTO = require("../../_default/Response.dto");
const ProjectResponse = require("../../dto/project/Project.response");
const ProjectQuery = require("../../dto/project/Project.query");
const ProjectValidation = require("../../validation/project/Project.validation");
const { projectService } = require("../../services/project/index");

async function fetchProjects(req, res) {
    const filters = ProjectQuery.create({
        page: 1, take: 10, ...req.query
    });

    let userId = null;
    // if(user.permission !== 'admin'){
    //     userId = req.user.id;
    // }

    const { projects, count } = await projectService.getProjects({ ...filters, userId });

    return ResponseDTO.success(res, { projects: ProjectResponse.create(projects), count });
}

async function exportUserProjectReport(req, res) {
    const { exportType, projectId } = req.params
    let result = {}
    if (exportType == 'excel') {
        result = await projectService.exportExcelUserReportProject(projectId, req.query)
    }
    return ResponseDTO.success(res, result)
}

async function fetchUserProjectReport(req, res) {
    const { projectId } = req.params;
    const report = await projectService.userReportProject(projectId, req.query)
    return ResponseDTO.success(res, report)
}

async function exportPerProjectReport(req, res) {
    const { exportType } = req.params
    let result = {}
    if (exportType == 'excel') {
        result = await projectService.exportExcelReportPerProject(req.query)
    }
    return ResponseDTO.success(res, result)
}

async function fetchPerProjectReport(req, res) {
    const report = await projectService.reportPerProject(req.query)
    return ResponseDTO.success(res, report)
}

async function addProjects(req, res) {
    const validData = ProjectValidation.createProject(req.body);
    const project = await projectService.createProject(validData);

    return ResponseDTO.success(res, { project: ProjectResponse.create(project) });
}

async function modifyProjects(req, res) {
    const { projectId } = req.params;
    const validData = ProjectValidation.createProject(req.body);
    const project = await projectService.updateProject(projectId, validData);

    return ResponseDTO.success(res, { project: ProjectResponse.create(project) });
}

async function assignProjectVideoFilesToUser(req, res) {
    const { projectId, userId } = req.params;
    return ResponseDTO.success(res);
}

async function removeProjects(req, res) {
    const { projectId } = req.params;
    await projectService.deleteProject(projectId);
    return ResponseDTO.success(res);
}


async function removeMainFileOfProject(req, res) {
    const { projectId } = req.params;
    await projectService.deleteMainFileOfProject(projectId);
    return ResponseDTO.success(res);
}


module.exports = {
    fetchProjects,
    exportUserProjectReport,
    fetchUserProjectReport,
    exportPerProjectReport,
    fetchPerProjectReport,
    addProjects,
    modifyProjects,
    assignProjectVideoFilesToUser,
    removeProjects,
    removeMainFileOfProject
}