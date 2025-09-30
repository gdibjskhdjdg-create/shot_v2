const AsyncHandler = require("../../../helper/asyncHandler.tool");
const {
    listVideoFilesForEqualizer,
    getEqualizerComparison,
    getEqualizerReports,
    startEqualizerProcess,
    submitEqualizerStatus,
    listEqualizerTasks
} = require("../../controllers/shotList/Equalizer.controller");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");

async function equalizerRoutes(fastify, opts) {
    fastify.post("/path/:projectId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['shot-list-equalize'])
        }, AsyncHandler(listVideoFilesForEqualizer));

    fastify.get("/compare/:equalizeId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['shot-list-equalize'])
        }, AsyncHandler(getEqualizerComparison));

    fastify.get("/reports",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['shot-list-equalize'])
        }, AsyncHandler(getEqualizerReports));

    fastify.post("/start/:shotId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['shot-list-equalize'])
        }, AsyncHandler(startEqualizerProcess));

    fastify.post("/confirm/:shotId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['shot-list-equalize'])
        }, AsyncHandler(submitEqualizerStatus));

    fastify.get("/",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['shot-list-equalize'])
        }, AsyncHandler(listEqualizerTasks));
}

module.exports = equalizerRoutes;
