const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const ProjectController = require("../../controllers/project/Project.controller");

const LoginRequiredMiddleware = require("../../middleware/user/LoginRequired.middleware");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");

/* ------------------------------ prefix: /api/project ------------------------------ */

async function projectRoutes(fastify, opts) {

    fastify.addHook('preHandler', LoginRequiredMiddleware());

    fastify.get('/report/user/:projectId',
        {
            preHandler: AuthorizationMiddleware(['report-project-user'])
        },
        ErrorBoundary(ProjectController.fetchUserProjectReport));


    fastify.get('/report/user/:projectId/export/:exportType',
        {
            preHandler: AuthorizationMiddleware(['report-project-user'])
        },
        ErrorBoundary(ProjectController.exportUserProjectReport));

    fastify.get('/report/perProject', {
        preHandler: AuthorizationMiddleware(['report-per-project'])
    },
        ErrorBoundary(ProjectController.fetchPerProjectReport));

    fastify.get('/report/perProject/export/:exportType', {
        preHandler: AuthorizationMiddleware(['report-per-project'])
    }, ErrorBoundary(ProjectController.exportPerProjectReport));

    fastify.get("/", {
        preHandler: AuthorizationMiddleware(["projects-list", "project-manage"])
    }, ErrorBoundary(ProjectController.fetchProjects));

    fastify.post("/", {
        preHandler: AuthorizationMiddleware(['project-manage'])
    }, ErrorBoundary(ProjectController.addProjects));

    fastify.patch("/:projectId", {
        preHandler: AuthorizationMiddleware(['project-manage'])
    }, ErrorBoundary(ProjectController.modifyProjects));

    fastify.delete("/:projectId", {
        preHandler: AuthorizationMiddleware(['project-manage'])
    }, ErrorBoundary(ProjectController.removeProjects));
}
module.exports = projectRoutes;