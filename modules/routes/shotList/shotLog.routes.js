const AsyncHandler = require("../../../helper/asyncHandler.tool");

const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");
const ShotLogController = require("../../controllers/shotList/ShotLog.controller");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");
const OnlyAdminMiddleware = require("../../middleware/user/OnlyAdmin.middleware");


/* ------------------------------ prefix: /api/shotList/log ------------------------------ */
async function shotLogRoutes(fastify, opts) {

    fastify.addHook('preHandler', OnlyLoginUserMiddleware());
    fastify.get("/:shotId", AsyncHandler(ShotLogController.getList));
    fastify.post("/:shotId", AsyncHandler(ShotLogController.create));
    fastify.register(async (fastifyProtected, opts) => {

        fastify.addHook('preHandler', OnlyAdminMiddleware);
        fastifyProtected.get("/report/specific-day", AsyncHandler(ShotLogController.getSpecificDayReport));
        fastifyProtected.get("/report/daily", AsyncHandler(ShotLogController.getDailyReport));
        fastifyProtected.get("/report/daily/export/:exportType", AsyncHandler(ShotLogController.exportDailyReport));
        fastifyProtected.get('/report/project-user/:userId', AsyncHandler(ShotLogController.geUserProjectsReport));
        fastifyProtected.get('/report/project-user/:userId/export/:exportType', AsyncHandler(ShotLogController.exportUserProjectsReport));
        fastifyProtected.get("/report/simple", AsyncHandler(ShotLogController.report));
    })

}
module.exports = shotLogRoutes;