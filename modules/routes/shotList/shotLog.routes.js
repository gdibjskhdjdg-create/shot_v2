const ErrorBoundary = require("../../../helper/errorBoundary.tool");

const LoginRequiredMiddleware = require("../../middleware/user/LoginRequired.middleware");
const ShotLogController = require("../../controllers/shotList/ShotLog.controller");
const StrictlyAdminMiddleware = require("../../middleware/user/StrictlyAdmin.middleware");


/* ------------------------------ prefix: /api/shotList/log ------------------------------ */
async function shotLogRoutes(fastify, opts) {

    fastify.addHook('preHandler', LoginRequiredMiddleware());
    fastify.get("/:shotId", ErrorBoundary(ShotLogController.fetchList));
    fastify.post("/:shotId", ErrorBoundary(ShotLogController.add));
    fastify.register(async (fastifyProtected, opts) => {

        fastify.addHook('preHandler', StrictlyAdminMiddleware);
        fastifyProtected.get("/report/specific-day", ErrorBoundary(ShotLogController.fetchSpecificDayReport));
        fastifyProtected.get("/report/daily", ErrorBoundary(ShotLogController.fetchDailyReport));
        fastifyProtected.get("/report/daily/export/:exportType", ErrorBoundary(ShotLogController.exportDailyData));
        fastifyProtected.get('/report/project-user/:userId', ErrorBoundary(ShotLogController.fetchUserProjectsReport ));
        fastifyProtected.get('/report/project-user/:userId/export/:exportType', ErrorBoundary(ShotLogController.exportUserProjectsData));
        fastifyProtected.get("/report/simple", ErrorBoundary(ShotLogController.generateReport));
    })

}
module.exports = shotLogRoutes;