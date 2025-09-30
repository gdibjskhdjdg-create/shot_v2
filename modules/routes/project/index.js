const AsyncHandler = require("../../../helper/asyncHandler.tool");
const ProjectController = require("../../controllers/project/Project.controller");

const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");

/* ------------------------------ prefix: /api/project ------------------------------ */

async function projectRoutes(fastify, opts) {

    fastify.addHook('preHandler', OnlyLoginUserMiddleware());

    fastify.get('/report/user/:projectId',
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['report-project-user'])
        },
        AsyncHandler(ProjectController.listProjects));


    fastify.get('/report/user/:projectId/export/:exportType',
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['report-project-user'])
        },
        AsyncHandler(ProjectController.exportUserReport));

    fastify.get('/report/perProject', {
        preHandler: CheckUserHaveValidAccessMiddleware(['report-per-project'])
    },
        AsyncHandler(ProjectController.getProjectsReport));

    fastify.get('/report/perProject/export/:exportType', {
        preHandler: CheckUserHaveValidAccessMiddleware(['report-per-project'])
    }, AsyncHandler(ProjectController.exportProjectsReport));

    fastify.get("/", {
        preHandler: CheckUserHaveValidAccessMiddleware(["projects-list", "project-manage"])
    }, AsyncHandler(ProjectController.listProjects));

    fastify.post("/", {
        preHandler: CheckUserHaveValidAccessMiddleware(['project-manage'])
    }, AsyncHandler(ProjectController.createProject));

    fastify.patch("/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['project-manage'])
    }, AsyncHandler(ProjectController.updateProject));

    fastify.delete("/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['project-manage'])
    }, AsyncHandler(ProjectController.deleteProject));
}
module.exports = projectRoutes;