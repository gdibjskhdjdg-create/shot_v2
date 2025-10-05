const AsyncHandler = require("../../../helper/asyncHandler.tool");

const ShotScoreController = require("../../controllers/shotList/ShotScore.controller");

/* ------------------------------ prefix: /api/shotList/score ------------------------------ */
// router.use(OnlyLoginUserMiddleware())
// router.use(CheckUserHaveValidAccessMiddleware(['shot-main-score', 'shot-list-score', 'shot-equalize-score', 'shot-editing-score']))
async function shotScoreROutes(fastify, opts) {


    fastify.get("/", AsyncHandler(ShotScoreController.fetchListBySection))
    fastify.get("/:shotId", AsyncHandler(ShotScoreController.fetchAllItems));
    fastify.post("/:shotId", AsyncHandler(ShotScoreController.save));

}

module.exports = shotScoreROutes;