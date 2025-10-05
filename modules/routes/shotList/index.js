const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const LoginRequiredMiddleware = require("../../middleware/user/LoginRequired.middleware");

const equalizerRoute = require("./equalizer.routes");
const categoryRoute = require("../category/category.routes");
const shotDefaultValueRoute = require("./shotDefaultValue.routes");
const shotLogRoute = require("./shotLog.routes");
const shotScoreRoute = require("./shotScore.routes");
const ShotController = require("../../controllers/shotList/Shot.controller");
const AccessToShotMiddleware = require("../../middleware/shotList/AccessToShot.middleware");
const StrictlyAdminMiddleware = require("../../middleware/user/StrictlyAdmin.middleware");
const ShotCanBeEditMiddleware = require("../../middleware/shotList/ShotCanBeEdit.middleware");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");

/* ------------------------------ prefix: /api/shotList ------------------------------ */

async function shotRoutes(fastify, opts) {

    fastify.get("/basicInfo", ErrorBoundary(ShotController.fetchBasicInfo));

    fastify.register(async (fastifyProtected, opts) => {


        fastifyProtected.addHook('preHandler', LoginRequiredMiddleware());
        fastify.register(equalizerRoute, { prefix: '/equalizer' });
        fastify.register(categoryRoute, { prefix: '/category' });
        fastify.register(shotDefaultValueRoute, { prefix: '/defaultValue' });
        fastify.register(shotLogRoute, { prefix: '/log' });
        fastify.register(shotScoreRoute, { prefix: '/score' });

        fastifyProtected.get("/exportInfo", ErrorBoundary(ShotController.fetchExportInfoShots));

        fastifyProtected.get("/",
            {
                preHandler: AuthorizationMiddleware([])
            }, ErrorBoundary(ShotController.fetchShotList));

        fastifyProtected.get("/list/equalize_need_meeting",
            {
                preHandler: AuthorizationMiddleware([])
            }, ErrorBoundary(ShotController.fetchMeetingShotList));

        fastifyProtected.get("/list/:status",
            {
                preHandler: AuthorizationMiddleware([])
            }, ErrorBoundary(ShotController.fetchShotList));

        fastifyProtected.get("/specialSearch",
            {
                preHandler: AuthorizationMiddleware([])
            }, ErrorBoundary(ShotController.fetchShotListSpecial));

        fastifyProtected.get("/specialSearch/getShotsId",
            {
                preHandler: AuthorizationMiddleware([])
            }, ErrorBoundary(ShotController.fetchExportShotsId));

        fastifyProtected.get("/specialSearch/export/:exportType",
            {
                preHandler: AuthorizationMiddleware([])
            }, ErrorBoundary(ShotController.exportSpecialShotList));

        fastifyProtected.get("/export/:exportType",
            {
                preHandler: AuthorizationMiddleware([])
            }, ErrorBoundary(ShotController.exportShotData));

        fastifyProtected.get("/export/:exportType/video/:videoFileId",
            {
                preHandler: AuthorizationMiddleware([])
            }, ErrorBoundary(ShotController.exportVideoShots));

        fastifyProtected.get("/export/:exportType/project/:projectId",
            {
                preHandler: AuthorizationMiddleware([])
            }, ErrorBoundary(ShotController.exportProjectShots));

        fastifyProtected.get("/export/:exportType/:shotId",
            {
                preHandler: AuthorizationMiddleware([])
            }, ErrorBoundary(ShotController.exportToExcel));
        // fastifyProtected.get("/reports", ErrorBoundary(ShotController.getReports));

        fastifyProtected.get("/:id",
            {
                preHandler: AuthorizationMiddleware([])
            }, ErrorBoundary(ShotController.fetchShotDetail));

        // shots of video detail list
        fastifyProtected.get("/videoFile/:videoFileId",
            {
                preHandler: AuthorizationMiddleware(['shot-full-access'])
            }, ErrorBoundary(ShotController.fetchShotOfVideoFile));

        fastifyProtected.get("/videoFile/init-check/:videoFileId",
            {
                preHandler: AuthorizationMiddleware([])
            }, ErrorBoundary(ShotController.fetchInitShotOfVideoFile));

        fastifyProtected.get("/videoFile/editor/:videoFileId",
            {
                preHandler: AuthorizationMiddleware(['shot-full-access', 'shot-list-editor'])
            }, ErrorBoundary(ShotController.fetchEditorShotOfVideoFile));

        fastifyProtected.get("/videoFile/equalizing/:videoFileId",
            {
                preHandler: AuthorizationMiddleware(['shot-full-access', 'shot-list-equalize'])
            }, ErrorBoundary(ShotController.fetchEqualizingShotOfVideoFile));

        // fastifyProtected.get("/videoFile/equalized/:videoFileId",
        //     {
        //         preHandler: AuthorizationMiddleware(['shot-full-access', 'shot-list-equalize'])
        //     }, ErrorBoundary(ShotController.getEqualizedShotOfVideoFile));
        // =========================

        fastifyProtected.post("/uploadExcel",
            {
                preHandler: AuthorizationMiddleware(['shot-import-excel', 'shot-full-access'])
            }, ErrorBoundary(ShotController.importFromExcel));

        fastifyProtected.post("/init-check/:videoFileId",
            {
                preHandler: AuthorizationMiddleware([])
            }, ErrorBoundary(ShotController.addInitShot));

        fastifyProtected.post("/editor/:videoFileId",
            {
                preHandler: AuthorizationMiddleware(['shot-full-access', 'shot-list-editor'])
            }, ErrorBoundary(ShotController.addEditorShot));

        fastifyProtected.post("/equalizing/:videoFileId",
            {
                preHandler: AuthorizationMiddleware(['shot-full-access', 'shot-list-equalize'])
            }, ErrorBoundary(ShotController.addEqualizingShot));


        fastifyProtected.patch("/init-check/:id",
            {
                preHandler: [
                    AuthorizationMiddleware([]),
                    AccessToShotMiddleware,
                    ShotCanBeEditMiddleware(['init-check', 'editor'])
                ]
            },
            ErrorBoundary(ShotController.modifyInitShot)
        );
        fastifyProtected.patch("/editor/:id", {
            preHandler: [
                AuthorizationMiddleware(['shot-full-access', 'shot-list-editor']),
                ShotCanBeEditMiddleware(['editor', 'equalizing']),
            ]
        },
            ErrorBoundary(ShotController.modifyEditorShot)
        );
        fastifyProtected.patch("/equalizing/:id", {
            preHandler: [
                AuthorizationMiddleware(['shot-full-access', 'shot-list-equalize']),
                ShotCanBeEditMiddleware(['equalizing', 'equalize_confirm', 'equalize_confirm_edit', 'equalize_need_meeting']),
            ]
        },
            ErrorBoundary(ShotController.modifyEqualizingShot)
        );
        fastifyProtected.patch("/equalize_need_meeting/:id", {
            preHandler: [
                AuthorizationMiddleware([]),
                AccessToShotMiddleware,
                ShotCanBeEditMiddleware(['equalize_need_meeting'])]
        },
            ErrorBoundary(ShotController.modifyNeedMeetingShot)
        );

        fastifyProtected.patch("/source/:id", { preHandler: [AuthorizationMiddleware(['shot-full-access']), AccessToShotMiddleware] }, ErrorBoundary(ShotController.modifyShot));
        fastifyProtected.put('/status/:id', { preHandler: StrictlyAdminMiddleware }, ErrorBoundary(ShotController.updateShotStatus));

        fastifyProtected.delete("/:id", { preHandler: [AuthorizationMiddleware(['shot-manage', 'shot-full-access']), AccessToShotMiddleware] }, ErrorBoundary(ShotController.removeShot));
        fastifyProtected.delete("/allOfVideoFile/:videoFileId", { preHandler: StrictlyAdminMiddleware }, ErrorBoundary(ShotController.removeShotsOfVideoFile));
        fastifyProtected.delete("/allOfProject/:projectId", { preHandler: StrictlyAdminMiddleware }, ErrorBoundary(ShotController.removeShotOfProject));
    })
}
module.exports = shotRoutes;