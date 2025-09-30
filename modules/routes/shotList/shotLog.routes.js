const AsyncHandler = require("../../../helper/asyncHandler.tool");

const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");
const {
    getShotLogs,
    createShotLog,
    getDailyLogReport,
    getDailySummaryReport,
    exportDailySummaryReport,
    getUserProjectsReport,
    exportUserProjectsReport,
    getShotGeneralReport
} = require("../../controllers/shotList/ShotLog.controller");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");
const OnlyAdminMiddleware = require("../../middleware/user/OnlyAdmin.middleware");


/* ------------------------------ prefix: /api/shotList/log ------------------------------ */
async function shotLogRoutes(fastify, opts) {

    fastify.addHook('preHandler', OnlyLoginUserMiddleware());
    fastify.get("/:shotId", AsyncHandler(getShotLogs));
    fastify.post("/:shotId", AsyncHandler(createShotLog));
    fastify.register(async (fastifyProtected, opts) => {

        fastify.addHook('preHandler', OnlyAdminMiddleware);
        fastifyProtected.get("/report/specific-day", AsyncHandler(getDailyLogReport));
        fastifyProtected.get("/report/daily", AsyncHandler(getDailySummaryReport));
        fastifyProtected.get("/report/daily/export/:exportType", AsyncHandler(exportDailySummaryReport));
        fastifyProtected.get('/report/project-user/:userId', AsyncHandler(getUserProjectsReport));
        fastifyProtected.get('/report/project-user/:userId/export/:exportType', AsyncHandler(exportUserProjectsReport));
        fastifyProtected.get("/report/simple", AsyncHandler(getShotGeneralReport));
    })

}
module.exports = shotLogRoutes;