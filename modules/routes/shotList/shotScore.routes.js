const ErrorBoundary = require("../../../helper/errorBoundary.tool");

const ShotScoreController = require("../../controllers/shotList/ShotScore.controller");

/* ------------------------------ prefix: /api/shotList/score ------------------------------ */
// router.use(OnlyLoginUserMiddleware())
async function shotScoreROutes(fastify, opts) {


    fastify.get("/", ErrorBoundary(ShotScoreController.fetchListBySection))
    fastify.get("/:shotId", ErrorBoundary(ShotScoreController.fetchAllItems));
    fastify.post("/:shotId", ErrorBoundary(ShotScoreController.save));

}

module.exports = shotScoreROutes;