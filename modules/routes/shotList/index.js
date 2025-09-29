const AsyncHandler = require("../../../helper/asyncHandler.tool");
const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");

const equalizerRoute = require("./equalizer.routes");
const categoryRoute = require("../category/category.routes");
const shotDefaultValueRoute = require("./shotDefaultValue.routes");
const shotLogRoute = require("./shotLog.routes");
const shotScoreRoute = require("./shotScore.routes");
const ShotController = require("../../controllers/shotList/Shot.controller");
const AccessToShotMiddleware = require("../../middleware/shotList/AccessToShot.middleware");
const OnlyAdminMiddleware = require("../../middleware/user/OnlyAdmin.middleware");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");
const ShotCanBeEditMiddleware = require("../../middleware/shotList/ShotCanBeEdit.middleware");

/* ------------------------------ prefix: /api/shotList ------------------------------ */

async function shotRoutes(fastify, opts) {

    fastify.get("/basicInfo", AsyncHandler(ShotController.getBasicInfo));

    fastify.register(async (fastifyProtected, opts) => {


        fastifyProtected.addHook('preHandler', OnlyLoginUserMiddleware());
        fastify.register(equalizerRoute, { prefix: '/equalizer' });
        fastify.register(categoryRoute, { prefix: '/category' });
        fastify.register(shotDefaultValueRoute, { prefix: '/defaultValue' });
        fastify.register(shotLogRoute, { prefix: '/log' });
        fastify.register(shotScoreRoute, { prefix: '/score' });

        fastifyProtected.get("/exportInfo", AsyncHandler(ShotController.getExportInfoShots));

        fastifyProtected.get("/",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(ShotController.getShotList));

        fastifyProtected.get("/list/equalize_need_meeting",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(ShotController.getMeetingShotList));

        fastifyProtected.get("/list/:status",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(ShotController.getShotList));

        fastifyProtected.get("/specialSearch",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(ShotController.getShotListSpecial));

        fastifyProtected.get("/specialSearch/getShotsId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(ShotController.getExportShotsId));

        fastifyProtected.get("/specialSearch/export/:exportType",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(ShotController.exportShotListSpecial));

        fastifyProtected.get("/export/:exportType",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(ShotController.exportShots));

        fastifyProtected.get("/export/:exportType/video/:videoFileId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(ShotController.exportShotsOfVideo));

        fastifyProtected.get("/export/:exportType/project/:projectId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(ShotController.exportShotsOfProject));

        fastifyProtected.get("/export/:exportType/:shotId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(ShotController.exportExcel));
        // fastifyProtected.get("/reports", AsyncHandler(ShotController.getReports));

        fastifyProtected.get("/:id",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(ShotController.getShotDetail));

        // shots of video detail list
        fastifyProtected.get("/videoFile/:videoFileId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access'])
            }, AsyncHandler(ShotController.getShotOfVideoFile));

        fastifyProtected.get("/videoFile/init-check/:videoFileId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(ShotController.getInitShotOfVideoFile));

        fastifyProtected.get("/videoFile/editor/:videoFileId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-editor'])
            }, AsyncHandler(ShotController.getEditorShotOfVideoFile));

        fastifyProtected.get("/videoFile/equalizing/:videoFileId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-equalize'])
            }, AsyncHandler(ShotController.getEqualizingShotOfVideoFile));

        fastifyProtected.get("/videoFile/equalized/:videoFileId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-equalize'])
            }, AsyncHandler(ShotController.getEqualizedShotOfVideoFile));
        // =========================

        fastifyProtected.post("/uploadExcel",
            {
                preHandler: CheckUserHaveValidAccessMiddleware(['shot-import-excel', 'shot-full-access'])
            }, AsyncHandler(ShotController.uploadExcel));

        fastifyProtected.post("/init-check/:videoFileId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(ShotController.createInitShot));

        fastifyProtected.post("/editor/:videoFileId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-editor'])
            }, AsyncHandler(ShotController.createEditorShot));

        fastifyProtected.post("/equalizing/:videoFileId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-equalize'])
            }, AsyncHandler(ShotController.createEqualizingShot));


        fastifyProtected.patch("/init-check/:id",
            {
                preHandler: [
                    CheckUserHaveValidAccessMiddleware([]),
                    AccessToShotMiddleware,
                    ShotCanBeEditMiddleware(['init-check', 'editor'])
                ]
            },
            AsyncHandler(ShotController.updateInitShot)
        );
        fastifyProtected.patch("/editor/:id", {
            preHandler: [
                CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-editor']),
                ShotCanBeEditMiddleware(['editor', 'equalizing']),
            ]
        },
            AsyncHandler(ShotController.updateEditorShot)
        );
        fastifyProtected.patch("/equalizing/:id", {
            preHandler: [
                CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-equalize']),
                ShotCanBeEditMiddleware(['equalizing', 'equalize_confirm', 'equalize_confirm_edit', 'equalize_need_meeting']),
            ]
        },
            AsyncHandler(ShotController.updateEqualizingShot)
        );
        fastifyProtected.patch("/equalize_need_meeting/:id", {
            preHandler: [
                CheckUserHaveValidAccessMiddleware([]),
                AccessToShotMiddleware,
                ShotCanBeEditMiddleware(['equalize_need_meeting'])]
        },
            AsyncHandler(ShotController.updateNeedMeetingShot)
        );

        fastifyProtected.patch("/source/:id", { preHandler: [CheckUserHaveValidAccessMiddleware(['shot-full-access']), AccessToShotMiddleware] }, AsyncHandler(ShotController.updateShot));
        fastifyProtected.put('/status/:id', { preHandler: OnlyAdminMiddleware }, AsyncHandler(ShotController.updateShotStatus));

        fastifyProtected.delete("/:id", { preHandler: [CheckUserHaveValidAccessMiddleware(['shot-manage', 'shot-full-access']), AccessToShotMiddleware] }, AsyncHandler(ShotController.deleteShot));
        fastifyProtected.delete("/allOfVideoFile/:videoFileId", { preHandler: OnlyAdminMiddleware }, AsyncHandler(ShotController.deleteShotsOfVideoFile));
        fastifyProtected.delete("/allOfProject/:projectId", { preHandler: OnlyAdminMiddleware }, AsyncHandler(ShotController.deleteShotOfProject));
    })
}
module.exports = shotRoutes;