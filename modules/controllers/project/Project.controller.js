const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");

const Project_DTO = require("../../dto/project/Project.dto");
const ProjectQuery_DTO = require("../../dto/project/ProjectQuery");
const { validateProjectData } = require("../../validation/project/Project.validation");
const { 
    listProjects: listProjectsService, 
    exportUserReportAsExcel, 
    getUserReportForProject, 
    exportProjectReportAsExcel, 
    getProjectReport, 
    createProject: createProjectService, 
    updateProject: updateProjectService, 
    deleteProject: deleteProjectService, 
    deleteMainFileOfProject 
} = require("../../services/project");

const listProjects = async (req, res) => {
    const query = getDataFromReqQuery(req);
    const filters = ProjectQuery_DTO.create({
        page: 1, take: 10, ...query
    });

    let userId = null;
    // if(user.permission !== 'admin'){
    //     userId = req.user.id;
    // }

    const { projects, count } = await listProjectsService({ ...filters, userId });

    return BaseController.ok(res, { projects: Project_DTO.create(projects), count });
}

const exportUserReport = async (req, res) => {
    const { exportType, projectId } = req.params;
    const query = getDataFromReqQuery(req);
    let result = {};
    if (exportType == 'excel') {
        result = await exportUserReportAsExcel(projectId , query);
    }
    return BaseController.ok(res, result);
}

const getUserReport = async (req, res) => {
    const { projectId } = req.params;
    const query = getDataFromReqQuery(req);
    const report = await getUserReportForProject(projectId, query);
    return BaseController.ok(res, report);
}

const exportProjectsReport = async (req, res) => {
    const { exportType } = req.params;
    const query = getDataFromReqQuery(req);
    let result = {};
    if (exportType == 'excel') {
        result = await exportProjectReportAsExcel(query);
    }
    return BaseController.ok(res, result);
}

const getProjectsReport = async (req, res) => {
    const query = getDataFromReqQuery(req);
    const reportData = await getProjectReport(query);
    return BaseController.ok(res, reportData);
}

const createProject = async (req, res) => {
    const validData = validateProjectData(req.body);
    const project = await createProjectService(validData);

    return BaseController.ok(res, { project: Project_DTO.create(project) });
}

const updateProject = async (req, res) => {
    const { projectId } = req.params;
    const validData = validateProjectData(req.body);
    const project = await updateProjectService(projectId, validData);

    return BaseController.ok(res, { project: Project_DTO.create(project) });
}

const assignVideosToUser = (req , res) => {
    const { projectId , userId } = req.params;
    return BaseController.ok(res);
}

const deleteProject = async (req, res) => {
    const { projectId } = req.params;
    await deleteProjectService(projectId);
    return BaseController.ok(res);
}

const deleteProjectMainFile = async (req, res) => {
    const { projectId } = req.params;
    await deleteMainFileOfProject(projectId);
    return BaseController.ok(res);
}

module.exports = {
    listProjects,
    exportUserReport,
    getUserReport,
    exportProjectsReport,
    getProjectsReport,
    createProject,
    updateProject,
    assignVideosToUser,
    deleteProject,
    deleteProjectMainFile
};