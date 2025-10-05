const AsyncHandler = require("../../../helper/asyncHandler.tool");
const EqualizerController = require("../../controllers/shotList/Equalizer.controller");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");


/* ------------------------------ prefix: /api/shotList/equalizer ------------------------------ */
async function equalizerRoutes(fastify, opts) {

    fastify.post("/path/:projectId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['shot-list-equalize'])
        }, AsyncHandler(EqualizerController.fetchVideoFileOfPathForEqualizer));

    fastify.get("/compare/:equalizeId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['shot-list-equalize'])
        }, AsyncHandler(EqualizerController.fetchEqualizeCompare));

    fastify.get("/reports",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['shot-list-equalize'])
        }, AsyncHandler(EqualizerController.fetchReports));

    fastify.post("/start/:shotId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['shot-list-equalize'])
        }, AsyncHandler(EqualizerController.initiateEqualizeProcess));

    fastify.post("/confirm/:shotId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['shot-list-equalize'])
        }, AsyncHandler(EqualizerController.submitEqualizerShotStatus));

    fastify.get("/",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['shot-list-equalize'])
        }, AsyncHandler(EqualizerController.fetchEqualizeList));
}
module.exports = equalizerRoutes;