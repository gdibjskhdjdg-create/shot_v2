const AsyncHandler = require("../../../helper/asyncHandler.tool");
const EqualizerController = require("../../controllers/shotList/Equalizer.controller");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");


/* ------------------------------ prefix: /api/shotList/equalizer ------------------------------ */
async function equalizerRoutes(fastify, opts) {

    fastify.post("/path/:projectId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['shot-list-equalize'])
        }, AsyncHandler(EqualizerController.getVideoFileOfPathForEqualizer));

    fastify.get("/compare/:equalizeId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['shot-list-equalize'])
        }, AsyncHandler(EqualizerController.getEqualizeCompare));

    fastify.get("/reports",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['shot-list-equalize'])
        }, AsyncHandler(EqualizerController.getReports));

    fastify.post("/start/:shotId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['shot-list-equalize'])
        }, AsyncHandler(EqualizerController.startEqualizeProcess));

    fastify.post("/confirm/:shotId",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['shot-list-equalize'])
        }, AsyncHandler(EqualizerController.submitStatusEqualizerShot));

    fastify.get("/",
        {
            preHandler: CheckUserHaveValidAccessMiddleware(['shot-list-equalize'])
        }, AsyncHandler(EqualizerController.getEqualizeList));
}
module.exports = equalizerRoutes;