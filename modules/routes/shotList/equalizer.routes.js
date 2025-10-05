const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const EqualizerController = require("../../controllers/shotList/Equalizer.controller");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");


/* ------------------------------ prefix: /api/shotList/equalizer ------------------------------ */
async function equalizerRoutes(fastify, opts) {

    fastify.post("/path/:projectId",
        {
            preHandler: AuthorizationMiddleware(['shot-list-equalize'])
        }, ErrorBoundary(EqualizerController.fetchVideoFileOfPathForEqualizer));

    fastify.get("/compare/:equalizeId",
        {
            preHandler: AuthorizationMiddleware(['shot-list-equalize'])
        }, ErrorBoundary(EqualizerController.fetchEqualizeCompare));

    fastify.get("/reports",
        {
            preHandler: AuthorizationMiddleware(['shot-list-equalize'])
        }, ErrorBoundary(EqualizerController.fetchReports));

    fastify.post("/start/:shotId",
        {
            preHandler: AuthorizationMiddleware(['shot-list-equalize'])
        }, ErrorBoundary(EqualizerController.initiateEqualizeProcess));

    fastify.post("/confirm/:shotId",
        {
            preHandler: AuthorizationMiddleware(['shot-list-equalize'])
        }, ErrorBoundary(EqualizerController.submitEqualizerShotStatus));

    fastify.get("/",
        {
            preHandler: AuthorizationMiddleware(['shot-list-equalize'])
        }, ErrorBoundary(EqualizerController.fetchEqualizeList));
}
module.exports = equalizerRoutes;