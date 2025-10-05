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
        AsyncHandler(ProjectController.fetchUserProjectReport));


    fastify.get('/report/user/:projectId/export/:exportType',
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['report-project-user'])
        },
        AsyncHandler(ProjectController.exportUserProjectReport));

    fastify.get('/report/perProject', {
        preHandler: CheckUserHaveValidAccessMiddleware(['report-per-project'])
    },
        AsyncHandler(ProjectController.fetchPerProjectReport));

    fastify.get('/report/perProject/export/:exportType', {
        preHandler: CheckUserHaveValidAccessMiddleware(['report-per-project'])
    }, AsyncHandler(ProjectController.exportPerProjectReport));

    fastify.get("/", {
        preHandler: CheckUserHaveValidAccessMiddleware(["projects-list", "project-manage"])
    }, AsyncHandler(ProjectController.fetchProjects));

    fastify.post("/", {
        preHandler: CheckUserHaveValidAccessMiddleware(['project-manage'])
    }, AsyncHandler(ProjectController.addProjects));

    fastify.patch("/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['project-manage'])
    }, AsyncHandler(ProjectController.modifyProjects));

    fastify.delete("/:projectId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['project-manage'])
    }, AsyncHandler(ProjectController.removeProjects));
}
module.exports = projectRoutes;