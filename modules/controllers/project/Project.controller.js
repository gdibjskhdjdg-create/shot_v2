const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");

const Project_DTO = require("../../dto/project/Project.dto");
const ProjectQuery_DTO = require("../../dto/project/ProjectQuery");
const ProjectValidation = require("../../validation/project/Project.validation");
const { projectService } = require("../../services/project/index");

class ProjectController {

    async getProjects(req, res) {
        const query = getDataFromReqQuery(req);
        const filters = ProjectQuery_DTO.create({
            page: 1, take: 10, ...query
        });

        let userId = null;
        // if(user.permission !== 'admin'){
        //     userId = req.user.id;
        // }

        const { projects, count } = await projectService.getProjects({ ...filters, userId });

        return BaseController.ok(res, { projects: Project_DTO.create(projects), count });
    }

    async exportUserReportProject(req, res) {
        const { exportType, projectId } = req.params
        const query = getDataFromReqQuery(req);
        let result = {}
        if (exportType == 'excel') {
            result = await projectService.exportExcelUserReportProject(projectId , query)
        }
        return BaseController.ok(res, result)
    }

    async userReportProject(req, res) {
        const { projectId } = req.params;
        const query = getDataFromReqQuery(req);
        const report = await projectService.userReportProject(projectId, query)
        return BaseController.ok(res, report)
    }

    async exportReportPerProject(req, res) {
        const { exportType } = req.params
        const query = getDataFromReqQuery(req);
        let result = {}
        if (exportType == 'excel') {
            result = await projectService.exportExcelReportPerProject(query)
        }
        return BaseController.ok(res, result)
    }

    async reportPerProject(req, res) {
        const query = getDataFromReqQuery(req);
        const report = await projectService.reportPerProject(query)
        return BaseController.ok(res, report)
    }

    async createProjects(req, res) {
        const validData = ProjectValidation.createProject(req.body);
        const project = await projectService.createProject(validData);

        return BaseController.ok(res, { project: Project_DTO.create(project) });
    }

    async updateProjects(req, res) {
        const { projectId } = req.params;
        const validData = ProjectValidation.createProject(req.body);
        const project = await projectService.updateProject(projectId, validData);

        return BaseController.ok(res, { project: Project_DTO.create(project) });
    }

    async assignVideoFilesOfProjectToUser(req , res){
        const { projectId , userId } = req.params;
        return BaseController.ok(res);
    }

    async deleteProjects(req, res) {
        const { projectId } = req.params;
        await projectService.deleteProject(projectId);
        return BaseController.ok(res);
    }

    
    async deleteMainFileOfProject(req, res) {
        const { projectId } = req.params;
        await projectService.deleteMainFileOfProject(projectId);
        return BaseController.ok(res);
    }
}

module.exports = new ProjectController();