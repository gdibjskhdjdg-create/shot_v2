const AsyncHandler = require("../../../helper/asyncHandler.tool");

const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");
const ShotLogController = require("../../controllers/shotList/ShotLog.controller");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");
const OnlyAdminMiddleware = require("../../middleware/user/OnlyAdmin.middleware");


/* ------------------------------ prefix: /api/shotList/log ------------------------------ */
async function shotLogRoutes(fastify, opts) {

    fastify.addHook('preHandler', OnlyLoginUserMiddleware());
    fastify.get("/:shotId", AsyncHandler(ShotLogController.fetchList));
    fastify.post("/:shotId", AsyncHandler(ShotLogController.add));
    fastify.register(async (fastifyProtected, opts) => {

        fastify.addHook('preHandler', OnlyAdminMiddleware);
        fastifyProtected.get("/report/specific-day", AsyncHandler(ShotLogController.fetchSpecificDayReport));
        fastifyProtected.get("/report/daily", AsyncHandler(ShotLogController.fetchDailyReport));
        fastifyProtected.get("/report/daily/export/:exportType", AsyncHandler(ShotLogController.exportDailyData));
        fastifyProtected.get('/report/project-user/:userId', AsyncHandler(ShotLogController.fetchUserProjectsReport ));
        fastifyProtected.get('/report/project-user/:userId/export/:exportType', AsyncHandler(ShotLogController.exportUserProjectsData));
        fastifyProtected.get("/report/simple", AsyncHandler(ShotLogController.generateReport));
    })

}
module.exports = shotLogRoutes;