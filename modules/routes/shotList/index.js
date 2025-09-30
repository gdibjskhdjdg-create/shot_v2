const AsyncHandler = require("../../../helper/asyncHandler.tool");
const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");

const equalizerRoute = require("./equalizer.routes");
const categoryRoute = require("../category/category.routes");
const shotDefaultValueRoute = require("./shotDefaultValue.routes");
const shotLogRoute = require("./shotLog.routes");
const shotScoreRoute = require("./shotScore.routes");
const shotController = require("../../controllers/shotList/Shot.controller");
const AccessToShotMiddleware = require("../../middleware/shotList/AccessToShot.middleware");
const OnlyAdminMiddleware = require("../../middleware/user/OnlyAdmin.middleware");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");
const ShotCanBeEditMiddleware = require("../../middleware/shotList/ShotCanBeEdit.middleware");

/* ------------------------------ prefix: /api/shotList ------------------------------ */

async function shotRoutes(fastify, opts) {

    fastify.get("/basicInfo", AsyncHandler(shotController.getShotBasicInfo));

    fastify.register(async (fastifyProtected, opts) => {


        fastifyProtected.addHook('preHandler', OnlyLoginUserMiddleware());
        fastify.register(equalizerRoute, { prefix: '/equalizer' });
        fastify.register(categoryRoute, { prefix: '/category' });
        fastify.register(shotDefaultValueRoute, { prefix: '/defaultValue' });
        fastify.register(shotLogRoute, { prefix: '/log' });
        fastify.register(shotScoreRoute, { prefix: '/score' });

        fastifyProtected.get("/exportInfo", AsyncHandler(shotController.getShotExportInfo));

        fastifyProtected.get("/",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(shotController.listShots));

        fastifyProtected.get("/list/equalize_need_meeting",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(shotController.listMeetingShots));

        fastifyProtected.get("/list/:status",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(shotController.listShots));

        fastifyProtected.get("/specialSearch",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(shotController.listSpecialShots));

        fastifyProtected.get("/specialSearch/getShotsId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(shotController.getExportableShotIds));

        fastifyProtected.get("/specialSearch/export/:exportType",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(shotController.exportSpecialShots));

        fastifyProtected.get("/export/:exportType",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(shotController.exportShotsByIds));

        fastifyProtected.get("/export/:exportType/video/:videoFileId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(shotController.exportShotsByVideoId));

        fastifyProtected.get("/export/:exportType/project/:projectId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(shotController.exportShotsByProjectId));

        fastifyProtected.get("/export/:exportType/:shotId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(shotController.exportSingleShotAsExcel));

        fastifyProtected.get("/:id",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(shotController.getShotDetails));

        // shots of video detail list
        fastifyProtected.get("/videoFile/:videoFileId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access'])
            }, AsyncHandler(shotController.listShotsByVideoFile));

        fastifyProtected.get("/videoFile/init-check/:videoFileId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(shotController.listInitShotsByVideoFile));

        fastifyProtected.get("/videoFile/editor/:videoFileId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-editor'])
            }, AsyncHandler(shotController.listEditorShotsByVideoFile));

        fastifyProtected.get("/videoFile/equalizing/:videoFileId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-equalize'])
            }, AsyncHandler(shotController.listEqualizingShotsByVideoFile));

        // =========================

        fastifyProtected.post("/uploadExcel",
            {
                preHandler: CheckUserHaveValidAccessMiddleware(['shot-import-excel', 'shot-full-access'])
            }, AsyncHandler(shotController.importShotsFromExcel));

        fastifyProtected.post("/init-check/:videoFileId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware([])
            }, AsyncHandler(shotController.createInitShot));

        fastifyProtected.post("/editor/:videoFileId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-editor'])
            }, AsyncHandler(shotController.createEditorShot));

        fastifyProtected.post("/equalizing/:videoFileId",
            {
                preHandler: CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-equalize'])
            }, AsyncHandler(shotController.createEqualizingShot));


        fastifyProtected.patch("/init-check/:id",
            {
                preHandler: [
                    CheckUserHaveValidAccessMiddleware([]),
                    AccessToShotMiddleware,
                    ShotCanBeEditMiddleware(['init-check', 'editor'])
                ]
            },
            AsyncHandler(shotController.updateInitShot)
        );
        fastifyProtected.patch("/editor/:id", {
            preHandler: [
                CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-editor']),
                ShotCanBeEditMiddleware(['editor', 'equalizing']),
            ]
        },
            AsyncHandler(shotController.updateEditorShot)
        );
        fastifyProtected.patch("/equalizing/:id", {
            preHandler: [
                CheckUserHaveValidAccessMiddleware(['shot-full-access', 'shot-list-equalize']),
                ShotCanBeEditMiddleware(['equalizing', 'equalize_confirm', 'equalize_confirm_edit', 'equalize_need_meeting']),
            ]
        },
            AsyncHandler(shotController.updateEqualizingShot)
        );
        fastifyProtected.patch("/equalize_need_meeting/:id", {
            preHandler: [
                CheckUserHaveValidAccessMiddleware([]),
                AccessToShotMiddleware,
                ShotCanBeEditMiddleware(['equalize_need_meeting'])]
        },
            AsyncHandler(shotController.updateMeetingShot)
        );

        fastifyProtected.patch("/source/:id", { preHandler: [CheckUserHaveValidAccessMiddleware(['shot-full-access']), AccessToShotMiddleware] }, AsyncHandler(shotController.updateShot));
        fastifyProtected.put('/status/:id', { preHandler: OnlyAdminMiddleware }, AsyncHandler(shotController.updateShotStatus));

        fastifyProtected.delete("/:id", { preHandler: [CheckUserHaveValidAccessMiddleware(['shot-manage', 'shot-full-access']), AccessToShotMiddleware] }, AsyncHandler(shotController.deleteShot));
        fastifyProtected.delete("/allOfVideoFile/:videoFileId", { preHandler: OnlyAdminMiddleware }, AsyncHandler(shotController.deleteShotsByVideoFileId));
        fastifyProtected.delete("/allOfProject/:projectId", { preHandler: OnlyAdminMiddleware }, AsyncHandler(shotController.deleteShotsByProjectId));
    })
}
module.exports = shotRoutes;