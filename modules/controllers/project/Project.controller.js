const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");

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

    return BaseController.ok(res, { projects: ProjectResponse.create(projects), count });
}

async function exportUserReportProject(req, res) {
    const { exportType, projectId } = req.params
    const query = getDataFromReqQuery(req);
    let result = {}
    if (exportType == 'excel') {
        result = await projectService.exportExcelUserReportProject(projectId, query)
    }
    return BaseController.ok(res, result)
}

async function userReportProject(req, res) {
    const { projectId } = req.params;
    const query = getDataFromReqQuery(req);
    const report = await projectService.userReportProject(projectId, query)
    return BaseController.ok(res, report)
}

async function exportReportPerProject(req, res) {
    const { exportType } = req.params
    const query = getDataFromReqQuery(req);
    let result = {}
    if (exportType == 'excel') {
        result = await projectService.exportExcelReportPerProject(query)
    }
    return BaseController.ok(res, result)
}

async function reportPerProject(req, res) {
    const query = getDataFromReqQuery(req);
    const report = await projectService.reportPerProject(query)
    return BaseController.ok(res, report)
}

async function createProjects(req, res) {
    const validData = ProjectValidation.createProject(req.body);
    const project = await projectService.createProject(validData);

    return BaseController.ok(res, { project: ProjectResponse.create(project) });
}

async function updateProjects(req, res) {
    const { projectId } = req.params;
    const validData = ProjectValidation.createProject(req.body);
    const project = await projectService.updateProject(projectId, validData);

    return BaseController.ok(res, { project: ProjectResponse.create(project) });
}

async function assignVideoFilesOfProjectToUser(req, res) {
    const { projectId, userId } = req.params;
    return BaseController.ok(res);
}

async function deleteProjects(req, res) {
    const { projectId } = req.params;
    await projectService.deleteProject(projectId);
    return BaseController.ok(res);
}


async function deleteMainFileOfProject(req, res) {
    const { projectId } = req.params;
    await projectService.deleteMainFileOfProject(projectId);
    return BaseController.ok(res);
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