const AsyncHandler = require("../../../helper/asyncHandler.tool");

const {
    listScoresBySection,
    getShotScores,
    saveShotScores
} = require("../../controllers/shotList/ShotScore.controller");

/* ------------------------------ prefix: /api/shotList/score ------------------------------ */
// router.use(OnlyLoginUserMiddleware())
// router.use(CheckUserHaveValidAccessMiddleware(['shot-main-score', 'shot-list-score', 'shot-equalize-score', 'shot-editing-score']))
async function shotScoreROutes(fastify, opts) {


    fastify.get("/", AsyncHandler(listScoresBySection))
    fastify.get("/:shotId", AsyncHandler(getShotScores));
    fastify.post("/:shotId", AsyncHandler(saveShotScores));

}

module.exports = shotScoreROutes;